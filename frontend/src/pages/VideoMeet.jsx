import React, { useEffect, useRef, useState } from "react";
import "../style/videoComponent.css";
import { TextField, Button, containerClasses  } from "@mui/material";
import { io } from "socket.io-client";


const SERVER_URL = "http://localhost:8000";

const connections = {};

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

export default function VideoMeetComponent() {

  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const videoRef = useRef([]);

  const [videos, setVideos] = useState([]);

  const getPermissions = async () =>{
    try {
  const videoPermission = await navigator.mediaDevices.getUserMedia({video: true})
  if(videoPermission){
    setVideoAvailable(true);
  }else {
    setVideoAvailable(false);
  }
    const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true})
  if(audioPermission){
    setAudioAvailable(true);
  }else {
    setAudioAvailable(false);
  }

  if(navigator.mediaDevices.getDisplayMedia){
    setScreenAvailable(true);
  }else{
    setScreenAvailable(false);
  }

  if(videoAvailable || audioAvailable){
    const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable })

    if(userMediaStream){
      window.localStream = userMediaStream;
      if(localVideoRef.current){
        localVideoRef.current.srcObject = userMediaStream;
      }
    }
  }
    }catch (err){
      console.log(err
      )
    }
  }

  useEffect(() =>{
        getPermissions();
  }, [])

  let getUserMediaSuccess = (stream) =>{
    try{

      if (window.localStream && window.localStream.getTracks) {
  window.localStream.getTracks().forEach(track => track.stop());
}

    }catch(e) {
      console.log(e)
    }

    window.localStream = stream;
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
  }

    for(let id in connections) {
      if( id === socketIdRef.current) continue;
      
      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description).then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
          }).catch(e => console.log(e))
      })
    }
    stream.getTracks().forEach(track => track.onended =  () => {
      setVideo(false);
      setAudio(false);

      try{
      const tracks = localVideoRef.current?.srcObject?.getTracks();

if (tracks) {
  tracks.forEach(track => track.stop());
}
      } catch(e )  { console.log(e)}

      // Todo BlackSlince
       let blackSlience = (...args ) => new MediaStream([black(...args), silence()])
            window.localStream = blackSlience();
            connections[socketListId].addStream(window.localStream);



      for(let id in connections){
        connections[id].addStream(window.localStream)
          connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id]}))
          })
        }) 
      }

    })
  }
  let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination())

    oscillator.start(); 
    ctx.resume()
    return Object.assign(dst.stream.getAudioTrack()[0], {enabled: false})
  }

  let black = ({width =  640, height= 480} = {}) => {
     let canvas = Object.assign(document.createElement("canvas"), {width, height});

    canvas.getContext('2d').fillRect(0, 0, width, height); 
     let stream  = canvas.captureStream();
     return Object.assign(stream.getVideoTracks()[0], {enabled: false})
  }






  let getUserMedia = () => {
     if((video && videoAvailable) || (audio && audioAvailable)){
      navigator.mediaDevices.getUserMedia({video: video, audio: audio})
      .then(getUserMediaSuccess)
      .then((stream) => {})
      .catch((e) => console.log(e))
     }else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop())
      }catch (e) {}
     }
  }

  useEffect(()=> {
    if(video !== undefined && audio !== undefined){
      getUserMedia();
    }
  }, [audio, video])

  let gotMessagefromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    if(fromId !== socketIdRef.current){
          if(signal.sdp){
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
              if(signal.sdp.type === "offer"){
                connections[fromId].createAnswer().then((description) => {
                  connections[fromId].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}))
                  }).catch(e => console.log(e))
                }).catch(e => console.log(e))
              }
            }).catch(e => console.log(e))
          }
    }
    if(signal.ice){
      connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
    }

  }

  let addMessage = () => {

  }

  let connectToSocketServer = () => {
   socketRef.current = io.connect(SERVER_URL, {secure: false})
    socketRef.current.on('signal', gotMessagefromServer);

      socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id

      socketRef.current.on("chat-message", addMessage)

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video)=> video.socketId !== id))
      })

      socketRef.current.on("user-joined", (id, clients = []) => {
        if (!Array.isArray(clients)) return;
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

          connections[socketListId].onicecandidate = (event) => {
            if(event.candidate !== null){
              socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
            }
          }
          
          connections[socketListId].onaddstream = (event) => {
            
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if(videoExists){
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.streams[0]} : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos
              })
            }else {
              let newVideo = {
                socketId: socketListId,
                stream: event.streams[0],
                autoPlay: true,
                playsInline:true
              }
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });


            }

          };

          if(window.localStream !== undefined && window.localStream !== null){
            connections[socketListId].addStream(window.localStream);
          }else {
            // TODO BlackSilence 
            // let blackSlience
            let blackSlience = (...args ) => new MediaStream([black(...args), silence()])
            window.localStream = blackSlience();
            connections[socketListId].addStream(window.localStream);



          }



        })

        if(id === socketIdRef.current){
          for(let id2 in connections){
            if(id2 === socketIdRef.current) continue

            try{
              connections[id2].addStream(window.localStream)
            }catch (e) {

            }connections[id2].createOffer().then((description)=>{
              connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}) )
              })
              .catch(e => console.log(e))
            })



          }
        }
      })
    })
  }

  let connectToSever = () => {
    socketRef.current = io.connect(SERVER_URL, {secure: false});

    socketRef.current.on('signal', gotMessagefromServer)
  }

  let getMdedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }







  return (
    <div>
         {askForUsername === true ?
         <div>
            <h2> enter into lobby</h2>
            <TextField id="filled-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
              <Button variant="contained" onClick={getMdedia}>Connect</Button>

               <div>
                <video ref={localVideoRef} autoPlay muted></video>

                {videos.map((video) => (
                  <div key={video.socketId} ></div>
                ))}

               </div>



         </div> 
         :
         <>
         <video ref={localVideoRef}></video>
         </>
        }
    </div>
  );
}
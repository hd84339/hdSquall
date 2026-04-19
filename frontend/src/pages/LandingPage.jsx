import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return <>
  <div className='landingPageContainer'>
        
        <nav>
          <div className='navHeader'>
           <h2>hdSquall</h2>
          </div>
          <div className='navlist'>
            <p href='#'>join as Guest</p>
            <p href='#'>Register</p>
            <div role='button'>
              <p href='#'>Login</p>
            </div>
          </div>
        </nav>
        <div className="landingMainContainer">
          <div className='landingTextContainer'>
            <h1> <span style={{color:"#ff9839"}}>Connect </span>  with your  hdSquall</h1>
            <p>Cover a distance with your team by hDSQuall</p>
            <div role='button' className="getStartedBtn">
              <Link to="/auth">Get Started</Link>
            </div>
            
          </div>
          <div className='landingImageContainer'>
            <img src="/mobile.png" alt="" />
        </div>




        </div>      
      </div>

  </>
}

export default LandingPage;



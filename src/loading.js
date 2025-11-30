// Loading.js

import React from 'react';
import './loading.css';

export default function LoadingPage() {
  return (
    <div className="loading-screen">
      <section class="loader">
        <div>
          <div>
            <span class="one h6"></span>
            <span class="two h3"></span>
          </div>
        </div>

        <div>
          <div>
            <span class="one h1"></span>
          </div>
        </div>

        <div>
          <div>
            <span class="two h2"></span>
          </div>
        </div>
        <div>
          <div>
            <span class="one h4"></span>
          </div>
        </div>
      </section>
       <div><p className="loading-text">Loading Powerstream Home...</p></div> 
    </div>
  );
}
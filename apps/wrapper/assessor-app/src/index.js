import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'animate.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import registerServiceWorker from './serviceWorkerRegistration';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// window.addEventListener('load', () =>
//   {
//    // registerSW();
// })

//serviceWorker.register();

registerServiceWorker();

async function registerSW(){
  if('serviceWorker' in navigator){

    try {
      await navigator.serviceWorker.register('./sw.js')
    } catch (error) {
      console.log(error)
    }

  }
}

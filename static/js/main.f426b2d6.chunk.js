(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{375:function(e,t,n){e.exports=n(896)},380:function(e,t,n){},896:function(e,t,n){"use strict";n.r(t);var a=n(64),r=n(65),o=n(67),c=n(66),i=n(68),s=n(1),l=n.n(s),u=n(7),d=(n(380),n(116)),m=function(e){function t(){return Object(a.a)(this,t),Object(o.a)(this,Object(c.a)(t).apply(this,arguments))}return Object(i.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return s.createElement(d.Spin,{size:"large",className:"absoluteCenter"})}}]),t}(s.Component),h=function(e){return e.body.getReader().read().then(function(e){return e})},f=new Audio,p=function(e){var t=new Blob([e.value],{type:"audio/mp3"}),n=window.URL.createObjectURL(t);f.src=n,f.play()},g=n(907),v=function(e){function t(e){var n;return Object(a.a)(this,t),n=Object(o.a)(this,Object(c.a)(t).call(this,e)),fetch(n.props.lyricsFile).then(function(e){return e.json()}).then(function(e){n.setState({lyrics:e}),console.log(e)}),n.state={lyrics:void 0,t:0},n}return Object(i.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){var e=this;requestAnimationFrame(function t(){var n=window.performance.now()-e.props.tStart;e.setState({t:2*n}),requestAnimationFrame(t)})}},{key:"render",value:function(){var e=this.state,t=e.lyrics,n=e.t;if(!t)return l.a.createElement("div",null);var a=t.slice().reverse().find(function(e){return e.start<n});if(!a)return l.a.createElement("div",null);var r=[a];return t.indexOf(a)<t.length-1&&r.push(t[t.indexOf(a)+1]),l.a.createElement("div",{className:"lines-div"},r.map(function(e,t){var r=e.records.find(function(t){return t.delta+e.start-1500>=n});return l.a.createElement("div",{className:"lyrics-line-div"},l.a.createElement("span",{className:"lyrics-line"},e.text,l.a.createElement("div",{className:"lyrics-highlight",style:{width:r&&e===a?"".concat(100*r.index/e.text.length,"%"):"0px"}})))}))}}]),t}(l.a.Component),b=d.Typography.Title,y=d.Typography.Text,S="".concat("https://cc197f2d.ngrok.io",":").concat(Object({NODE_ENV:"production",PUBLIC_URL:"/tamouya-gouli",REACT_APP_SERVER_IP:"https://cc197f2d.ngrok.io"}).REACT_APP_SERVER_PORT?Object({NODE_ENV:"production",PUBLIC_URL:"/tamouya-gouli",REACT_APP_SERVER_IP:"https://cc197f2d.ngrok.io"}).REACT_APP_SERVER_PORT:"");console.log(S);var E=function(e){function t(e){var n;Object(a.a)(this,t),(n=Object(o.a)(this,Object(c.a)(t).call(this,e))).refSoumah=void 0,n.audioReady=!1,n.bgAudio=new Audio,n.handleServerError=function(e){console.error(e),console.log("Server offline?"),n.setState({serverState:"offline"})},n.first=!0,n.onAnyClick=function(){n.first&&(f.play(),n.bgAudio.play(),n.first=!1)},n.avatars=[{scale:1,src:["momo.png"]}],n.connect(),n.refSoumah=s.createRef();return requestAnimationFrame(function e(){void 0===n.state.bgAudioStart&&n.bgAudio.currentTime>0&&n.setState({bgAudioStart:window.performance.now()}),n.setState({t:window.performance.now()}),requestAnimationFrame(e)}),n.bgAudio.addEventListener("canplay",function(){n.audioReady=!0}),n.bgAudio.addEventListener("ended",function(){n.setState({bgAudioStart:void 0})}),n.bgAudio.src="tamouya_gouli.mp3",n.state={serverState:"loading",applicationState:void 0,unsupportedLanguageCodes:void 0,t:window.performance.now()},n}return Object(i.a)(t,e),Object(r.a)(t,[{key:"connect",value:function(){var e=this;fetch(S+"/u-there",{mode:"cors"}).then(function(e){return e.text()}).then(function(t){"we here"===t&&(console.log("Server online"),e.setState({serverState:"online"}),e.getApplicationState())}).catch(this.handleServerError)}},{key:"getApplicationState",value:function(){var e=this;fetch(S+"/state",{mode:"cors"}).then(function(e){return e.json()}).then(function(t){e.setState({applicationState:t}),e.sortUnsupportedTextToSpeech()}).catch(this.handleServerError)}},{key:"sortUnsupportedTextToSpeech",value:function(){var e=this;fetch(S+"/unsupported-languages-text-to-speech",{mode:"cors"}).then(function(e){return e.json()}).then(function(t){console.log(t),e.setState({unsupportedLanguageCodes:t.map(function(e){return e.languageCode})})}).catch(this.handleServerError)}},{key:"playResultSound",value:function(e){this.onAnyClick(),fetch(S+"/text-to-speech?text=".concat(e.local,"&languageCode=").concat(e.language.Code)).then(h).then(p).catch(function(e){console.error(e)})}},{key:"componentDidMount",value:function(){var e,t=this;!function n(){requestAnimationFrame(n),void 0===t.state.bgAudioStart||e||(e=window.performance.now());for(var a=document.getElementsByClassName("soumah"),r=0;r<a.length;r++){var o=a[r],c=o.getAttribute("index"),i=o.getAttribute("scale"),s=e?2*(window.performance.now()+1500*c-e)/1e3:0,l=5*Math.sin(s)-10,u=12*Math.sin(s),d=1+.15*Math.sin(2*s),m=150*Math.sin(s)-120,h=50+100*Math.abs(Math.sin(s)),f="";f+="translateX(".concat(m,"px) translateY(").concat(h,"px) "),f+="skewX(".concat(0,"deg) skewY(").concat(u,"deg) "),f+="rotateX(".concat(0,"deg) rotateY(").concat(0,"deg) rotateZ(").concat(l,"deg) "),f+="scaleX(".concat(d,") scaleY(").concat(d,") "),i&&(f+="scaleX(".concat(i,") scaleY(").concat(i,") ")),o.style.transform=f}}()}},{key:"render",value:function(){var e=this,t=this.state.t,n=void 0!==this.state.bgAudioStart&&t-this.state.bgAudioStart>=232e3&&t-this.state.bgAudioStart<=334e3,a=void 0!==this.state.bgAudioStart&&t-this.state.bgAudioStart>=117e3&&t-this.state.bgAudioStart<=18e4,r=this.state.serverState;return s.createElement("div",{className:"expand",onClick:function(){return e.onAnyClick()}},s.createElement("div",{className:"backgroundDiv",onClick:function(){return e.onAnyClick()}},s.createElement("img",{className:"background",src:"background.png"}),this.avatars.map(function(t,a){var r={scale:t.scale,index:a};return t.src.map(function(t,o){return s.createElement("img",Object.assign({key:a+"a"+o,className:"soumah",src:n?"momo_flute.png":t},r,{onClick:function(){return e.onAnyClick()}}))})}),this.state.bgAudioStart&&s.createElement("div",{className:"lyrics-div"},s.createElement(v,{lyricsFile:"lyrics.json",tStart:this.state.bgAudioStart}))),a&&this.renderXylophoneStick(t,!1),a&&this.renderXylophoneStick(t,!0),a&&s.createElement("img",{style:{position:"absolute",bottom:0,right:"35vw"},src:"xylophone.png"}),"loading"===r?s.createElement(m,null):s.createElement("div",{className:"main"},"offline"===r?s.createElement(y,null,"Server offline"):this.renderServerOnline()))}},{key:"renderXylophoneStick",value:function(e,t){var n=(e=t?e:e+120)%120/120;return e%240<=120||(n=1-n),s.createElement("img",{src:"xylophone_stick.png",className:"backgroundElement",style:{bottom:"".concat(t?0:60,"px"),left:"calc(50vw + ".concat(t?150:-300,"px)"),transform:"rotateZ(".concat(n*(t?-90:90),"deg)"),transformOrigin:"bottom"}})}},{key:"renderServerOnline",value:function(){var e=this.state.applicationState;return s.createElement("div",null,e&&this.renderApplicationState(e))}},{key:"renderApplicationState",value:function(e){var t=this,n=this.state.unsupportedLanguageCodes,a=e.inputLanguage,r=e.input,o=e.results,c=function(e){return void 0===n||!n.includes(e.language.Code)},i=o.filter(c).concat(o.filter(function(e){return!c(e)}));return s.createElement("div",{className:"column"},s.createElement(b,{level:3},"Official translations for..."),s.createElement("div",{className:"row listStart"},s.createElement(y,{className:"speechAsText"},'"',r,'"')),i.map(function(e,n){return s.createElement("div",{className:"row",key:n},s.createElement(y,null,e.language.Name,":"),s.createElement(y,{className:"speechAsText"},e.local),c(e)&&s.createElement(g.a,{onClick:function(){return t.playResultSound(e)}}),a===e.language&&s.createElement(y,null,"(",e.translation,")"))}))}}]),t}(s.Component),A=function(e){function t(e){var n;return Object(a.a)(this,t),(n=Object(o.a)(this,Object(c.a)(t).call(this,e))).state={},n}return Object(i.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return s.createElement(E,null)}}]),t}(s.Component),k=document.getElementById("root");Object(u.render)(s.createElement(A,null),k)}},[[375,2,1]]]);
//# sourceMappingURL=main.f426b2d6.chunk.js.map
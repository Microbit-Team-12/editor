(this.webpackJsonpeditor=this.webpackJsonpeditor||[]).push([[0],{159:function(e,t){},161:function(e,t){},171:function(e,t,n){},492:function(e,t,n){},493:function(e,t,n){"use strict";n.r(t);var r,a=n(0),i=n.n(a),s=n(31),o=n.n(s),c=n(3),u=n.n(c),l=n(4),h=n(14),p=n(15),d=n(41),f=n(40),v=n(513),b=n(511),x=n(85),g=n(122),m=n(123),k={connectOption:{baudRate:115200,dataBits:8,stopBits:1,parity:"none",bufferSize:4096,flowControl:"none"},requestOption:{filters:[{usbVendorId:3368}]},readOption:{showLog:!0,updateMs:50,cutLength:1e3},signalOption:{showLog:!0,replLineReady:">>> ",executionDone:"Execute Done: 0x3f3f3f3f",executionStart:"Execution Start: 0x3f3f3f3f",mainPYException:'Traceback (most recent call last):\r\n  File "main.py", line ',execException:'Traceback (most recent call last):\r\n  File "<stdin>", line 1, in <module>\r\n  File "<string>", line ',waitMsBeforeReboot:1}},w=n(60),y=n.n(w);!function(e){e[e.Free=0]="Free",e[e.Busy=1]="Busy"}(r||(r={}));var O=function(){function e(t,n){Object(h.a)(this,e),this.portReader=void 0,this.signal=void 0,this.startSignals=void 0,this.endSignals=void 0,this.portReader=t,this.signal=n,this.startSignals=[n.executionStart+"\r\n",n.mainPYException,n.execException],this.endSignals=[n.executionDone+"\r\n",n.executionStart+"\r\n",n.mainPYException,n.execException]}return Object(p.a)(e,[{key:"readUntilNewREPLLine",value:function(){return this.portReader.safeReadUntil(this.signal.replLineReady)}},{key:"readCodeOutput",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.portReader.safeReadUntilWithUpdate(this.startSignals,(function(e){return null}));case 2:if(0===e.sent){e.next=7;break}this.readErrors(t),e.next=18;break;case 7:console.log("Execution Start"),n=1;case 9:if(1!==n){e.next=16;break}return e.next=12,this.portReader.safeReadUntilWithUpdate(this.endSignals,(function(e){return t.write({kind:"NormalOutput",outputChunk:e})}));case 12:1===(n=e.sent)&&t.write({kind:"ResetPressed"}),e.next=9;break;case 16:0!==n?this.readErrors(t):t.end(),console.log("Execution done");case 18:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"readErrors",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n,r,a,i,s;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.portReader.unsafeReadline();case 2:n=e.sent,r=n.split(",",2)[0],a=0,i="";case 6:if(0!==a&&!i.startsWith("  ")){e.next=13;break}return e.next=9,this.portReader.unsafeReadline();case 9:i=e.sent,a+=1,e.next=6;break;case 13:s=i.split(": "),t.write({kind:"ErrorMessage",line:parseInt(r)-1,type:s[0],message:1===a?"":"In eval, "+s[1]}),t.end();case 16:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()}]),e}(),j=function(){function e(t,n){Object(h.a)(this,e),this.serialBuffer="",this.portReader=void 0,this.config=void 0,this.portReader=t,this.config=n}return Object(p.a)(e,[{key:"readLoop",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n,r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:this.config.showLog&&console.log(this.serialBuffer);case 1:if(t(this.serialBuffer)){e.next=10;break}return e.next=4,this.portReader.read();case 4:n=e.sent,r=n.value,this.serialBuffer+=r,this.config.showLog&&console.log(this.serialBuffer),e.next=1;break;case 10:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"readLoopWithCut",value:function(){var e=Object(l.a)(u.a.mark((function e(t,n){var r,a,i;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:this.config.showLog&&console.log(this.serialBuffer);case 1:if(t(this.serialBuffer)){e.next=12;break}return(r=this.serialBuffer.length)>=n&&(this.serialBuffer=this.serialBuffer.substring(r-n)),e.next=6,this.portReader.read();case 6:a=e.sent,i=a.value,this.serialBuffer+=i,this.config.showLog&&console.log(this.serialBuffer),e.next=1;break;case 12:case"end":return e.stop()}}),e,this)})));return function(t,n){return e.apply(this,arguments)}}()},{key:"splitBufferOnFirst",value:function(e){var t=this.serialBuffer.indexOf(e),n=this.serialBuffer.substr(0,t);return this.serialBuffer=this.serialBuffer.substr(t+e.length),n}},{key:"unsafeReadline",value:function(){var e=Object(l.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t="\r\n",e.next=3,this.readLoop((function(e){return e.includes(t)}));case 3:return e.abrupt("return",this.splitBufferOnFirst(t));case 4:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"safeReadUntil",value:function(){var e=Object(l.a)(u.a.mark((function e(t){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.readLoopWithCut((function(e){return e.includes(t)}),t.length);case 2:this.splitBufferOnFirst(t);case 3:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"safeReadUntilWithUpdate",value:function(){var e=Object(l.a)(u.a.mark((function e(t,n){var r,a,i,s,o=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=!1,a=-1,i=function(e){return r=!0,t.forEach((function(t,n){e.includes(t)&&(a=n)})),-1!==a},s=setInterval((function(){r&&(n(o.serialBuffer),r=!1)}),this.config.updateMs),e.next=6,this.readLoopWithCut(i,this.config.cutLength);case 6:return clearInterval(s),n(this.splitBufferOnFirst(t[a])),e.abrupt("return",a);case 9:case"end":return e.stop()}}),e,this)})));return function(t,n){return e.apply(this,arguments)}}()}]),e}(),E=function(){function e(t,n){if(Object(h.a)(this,e),this.port=void 0,this.portWriter=void 0,this.portReader=void 0,this.portParser=void 0,this.signal=void 0,this.state=void 0,this.portWriterStreamClosed=null,this.portReaderStreamClosed=null,this.port=t,this.signal=n.signalOption,this.state=r.Free,null!=t.writable){var a=new TextEncoderStream;this.portWriterStreamClosed=a.readable.pipeTo(t.writable).catch((function(e){console.log("disconnected in pipe")})),this.portWriter=a.writable.getWriter()}if(null!=t.readable){var i=new TextDecoderStream;this.portReaderStreamClosed=t.readable.pipeTo(i.writable).catch((function(e){console.log("disconnected in pipe")})),this.portReader=i.readable.getReader();var s=new j(this.portReader,n.readOption);this.portParser=new O(s,n.signalOption)}}return Object(p.a)(e,[{key:"getState",value:function(){return this.state}},{key:"codeToPythonString",value:function(e){return("print('"+this.signal.executionStart+"')\r\n"+e+"\r\nprint('"+this.signal.executionDone+"')").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r?\n/g,"\\r\\n")}},{key:"getREPLLine",value:function(){var e=Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.portWriter.write("\x03");case 2:return e.next=4,this.portParser.readUntilNewREPLLine();case 4:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"flash",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n,a,i=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state!==r.Busy){e.next=2;break}throw Error("Flash Failed: Device not free");case 2:return this.state=r.Busy,n=this.codeToPythonString(t),a=new y.a,e.next=7,this.getREPLLine();case 7:return e.next=9,this.portWriter.write("file=open('main.py','w');s='"+n+"';file.write(s);file.close();from microbit import *;reset()\r");case 9:return this.portParser.readCodeOutput(a).then((function(){i.state=r.Free})).catch((function(){a.end()})),e.abrupt("return",a);case 11:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"execute",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n,a,i=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state!==r.Busy){e.next=2;break}throw Error("Execute Failed: Device not free");case 2:return this.state=r.Busy,n=this.codeToPythonString(t),a=new y.a,e.next=7,this.getREPLLine();case 7:return e.next=9,this.portWriter.write("s='"+n+"';exec(s)\r");case 9:return this.portParser.readCodeOutput(a).then((function(){i.state=r.Free})).catch((function(){a.end()})),e.abrupt("return",a);case 11:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"reboot",value:function(){var e=Object(l.a)(u.a.mark((function e(){var t,n=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state!==r.Busy){e.next=2;break}throw Error("Reboot Failed: Device not free");case 2:return this.state=r.Busy,e.next=5,this.getREPLLine();case 5:return e.next=7,this.portWriter.write("from microbit import *;reset()\r");case 7:return t=new y.a,this.portParser.readCodeOutput(t).then((function(){n.state=r.Free})).catch((function(){t.end()})),e.abrupt("return",t);case 10:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"waitUntil",value:function(e){return new Promise((function(t,n){var r=setInterval((function(){e()&&(clearInterval(r),t())}),200)}))}},{key:"interrupt",value:function(){var e=Object(l.a)(u.a.mark((function e(){var t=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state!==r.Free){e.next=2;break}throw Error("Interupt Failed: Device not running code");case 2:return e.next=4,this.portWriter.write("\x03");case 4:return e.next=6,this.waitUntil((function(){return t.state===r.Busy}));case 6:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"disconnect",value:function(){var e=Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("Disconnection initiated:"),e.next=3,this.portReader.cancel("App will unmount");case 3:return e.next=5,this.portReaderStreamClosed;case 5:return console.log("Reader closed;"),e.next=8,this.portWriter.abort("App will unmount");case 8:return e.next=10,this.portWriterStreamClosed;case 10:return console.log("Writer closed."),e.next=13,this.port.close();case 13:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()}]),e}();function R(e,t){return S.apply(this,arguments)}function S(){return(S=Object(l.a)(u.a.mark((function e(t,n){var r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,t.open(n.connectOption);case 3:e.next=8;break;case 5:return e.prev=5,e.t0=e.catch(0),e.abrupt("return",{kind:"ConnectionFailure",type:"Failed to Open Port",reason:e.t0.message});case 8:return r=new E(t,n),e.abrupt("return",{kind:"MicrobitConnection",interact:r,disconnection:new Promise((function(e,n){t.addEventListener("disconnect",(function n(r){console.log("disconnected"),t.removeEventListener("disconnect",n),e()}))}))});case 10:case"end":return e.stop()}}),e,null,[[0,5]])})))).apply(this,arguments)}function P(){return L.apply(this,arguments)}function L(){return(L=Object(l.a)(u.a.mark((function e(){var t,n,r=arguments;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=r.length>0&&void 0!==r[0]?r[0]:k,e.prev=1,e.next=4,navigator.serial.requestPort(t.requestOption);case 4:n=e.sent,e.next=10;break;case 7:return e.prev=7,e.t0=e.catch(1),e.abrupt("return",{kind:"ConnectionFailure",type:"Failed to Obtain Port",reason:e.t0.message});case 10:return e.abrupt("return",R(n,t));case 11:case"end":return e.stop()}}),e,null,[[1,7]])})))).apply(this,arguments)}function C(){return F.apply(this,arguments)}function F(){return(F=Object(l.a)(u.a.mark((function e(){var t,n,r=arguments;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=r.length>0&&void 0!==r[0]?r[0]:k,e.next=3,navigator.serial.getPorts();case 3:if(1!==(n=e.sent).length){e.next=8;break}return e.abrupt("return",R(n[0],t));case 8:if(0!==n.length){e.next=12;break}return e.abrupt("return",{kind:"ConnectionFailure",type:"Failed to Obtain Port",reason:"No Paired Serial Devices Available"});case 12:return e.abrupt("return",{kind:"ConnectionFailure",type:"Failed to Obtain Port",reason:"Multiple Paired Serial Devices Available"});case 13:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function B(){return I.apply(this,arguments)}function I(){return(I=Object(l.a)(u.a.mark((function e(){var t,n,r=arguments;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=function(e,t){if(void 0===t)return!0;var n,r=Object(g.a)(t);try{for(r.s();!(n=r.n()).done;){var a=n.value;if((void 0===a.usbProductId||a.usbProductId===e.usbProductId)&&(void 0===a.usbVendorId||a.usbVendorId===e.usbVendorId))return!0}}catch(i){r.e(i)}finally{r.f()}return!1},t=r.length>0&&void 0!==r[0]?r[0]:k,e.abrupt("return",new Promise((function(e,r){var a=function(){var r=Object(l.a)(u.a.mark((function r(i){var s;return u.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:s=i.port||i.target,n(s.getInfo(),t.requestOption.filters)&&(navigator.serial.removeEventListener("connect",a),e(R(s,t)));case 2:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}();navigator.serial.addEventListener("connect",a)})));case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)}n(171);var N=n(54),D=n(16),W=n(124),U=n.n(W),M=n(514),A=n(506),T=n(508),_=n(509),q=n(510),V=n(507),Y=n(6),J=function(e){Object(d.a)(n,e);var t=Object(f.a)(n);function n(e){var r;if(Object(h.a)(this,n),(r=t.call(this,e)).isExpandable=void 0,r.highlightStart=void 0,r.highlightEnd=void 0,r.lines=void 0,r.state={isExpanded:!1},r.isExpandable=!1,r.lines=r.props.code.split("\n"),r.highlightStart=0,r.highlightEnd=r.lines.length,r.lines.length>0){var a=r.lines[0].split("# LINES ");if(2===a.length){var i=a[1].split("-"),s=parseInt(i[0]),o=parseInt(i[1]);isNaN(s)||isNaN(o)||(r.highlightStart=s-1,r.highlightEnd=o-1+1,r.isExpandable=!0)}}return r}return Object(p.a)(n,[{key:"onExpand",value:function(){this.setState({isExpanded:!this.state.isExpanded})}},{key:"onFlash",value:function(){var e=Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(void 0===this.props.onFlash){e.next=3;break}return e.next=3,this.props.onFlash(this.props.code);case 3:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"onLoad",value:function(){this.props.onLoad(this.lines.slice(this.highlightStart,this.highlightEnd).join("\n"))}},{key:"render",value:function(){var e=this.state.isExpanded?[0,this.lines.length]:[this.highlightStart,this.highlightEnd],t=Object(D.a)(e,2),n=t[0],r=t[1];return Object(Y.jsxs)("div",{className:"Docs-code",children:[Object(Y.jsx)(M.a,{style:A.a,language:"py",showLineNumbers:this.state.isExpanded,children:this.lines.slice(n,r).join("\n")}),Object(Y.jsx)(V.a,{onClick:this.onExpand.bind(this),disabled:!this.isExpandable,children:Object(Y.jsx)(T.a,{})}),Object(Y.jsx)(V.a,{onClick:this.onFlash.bind(this),disabled:void 0===this.props.onFlash,children:Object(Y.jsx)(_.a,{})}),Object(Y.jsx)(V.a,{onClick:this.onLoad.bind(this),children:Object(Y.jsx)(q.a,{})})]})}}]),n}(i.a.Component),z=function(e){Object(d.a)(n,e);var t=Object(f.a)(n);function n(){var e;Object(h.a)(this,n);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(e=t.call.apply(t,[this].concat(a))).renderers={code:e.renderCode.bind(Object(N.a)(e))},e}return Object(p.a)(n,[{key:"renderCode",value:function(e){return"py"===e.language?Object(Y.jsx)(J,{code:e.value,onFlash:this.props.onFlash,onLoad:this.props.onLoad}):Object(Y.jsx)(M.a,{style:A.a,language:e.language,children:e.value})}},{key:"render",value:function(){return Object(Y.jsx)(U.a,{className:"APIDemo-docs",renderers:this.renderers,children:this.props.markdown})}}]),n}(i.a.Component),H=function(e){Object(d.a)(n,e);var t=Object(f.a)(n);function n(e){var r;return Object(h.a)(this,n),(r=t.call(this,e)).state={docs:"# Title\n\nDid you know you can use tildes instead of backticks?\n\n~~~py\n# LINES 6-10\nfrom microbit import *\nimport music\n\nwhile True:\n    if button_a.is_pressed():\n        display.show(Image.MUSIC_QUAVER)\n        music.play(music.NYAN)\n    if button_b.is_pressed():\n        display.show(Image.MEH)\n        music.play(music.POWER_DOWN)\n    \n    display.show(Image.COW)\n~~~\n\nMore text\n",output:"",connection:null,editor:null},"serial"in navigator||"usb"in navigator&&(navigator.serial=m.serial,1)||alert("Browser not supported"),x.b.init().then((function(e){console.log(e)})),r}return Object(p.a)(n,[{key:"componentWillUnmount",value:function(){var e;null===(e=this.state.connection)||void 0===e||e.interact.disconnect()}},{key:"renderStartButton",value:function(){return Object(Y.jsx)(v.a,{paddingLeft:2,children:Object(Y.jsx)(b.a,{className:"APIDemo-button",variant:"contained",disabled:null!==this.state.connection,onClick:this.onStart.bind(this),children:"Start"})})}},{key:"renderButtonRequiringConnection",value:function(e,t){return Object(Y.jsx)(v.a,{paddingLeft:2,children:Object(Y.jsx)(b.a,{className:"APIDemo-button",variant:"contained",disabled:null===this.state.connection,onClick:function(){return t()},children:e})})}},{key:"handleEditorDidMount",value:function(e,t){this.setState({editor:e})}},{key:"render",value:function(){var e=this;return Object(Y.jsxs)("div",{className:"APIDemo",children:[Object(Y.jsxs)("header",{className:"APIDemo-header",children:[this.renderStartButton(),this.renderButtonRequiringConnection("Run Code",(function(){return e.onRun(e.state.editor.getValue())})),this.renderButtonRequiringConnection("Flash Code",(function(){return e.onFlash(e.state.editor.getValue())})),this.renderButtonRequiringConnection("Interrupt",this.onInterrupt.bind(this)),this.renderButtonRequiringConnection("Reboot",this.onReboot.bind(this))]}),Object(Y.jsxs)("div",{className:"APIDemo-textareas",children:[Object(Y.jsx)(z,{markdown:this.state.docs,onFlash:null===this.state.connection?void 0:this.onFlash.bind(this),onLoad:this.onLoad.bind(this)}),Object(Y.jsx)(x.a,{defaultLanguage:"python",defaultValue:"from microbit import *\nimport music\n\nwhile True:\n    if accelerometer.was_gesture('shake'):\n        display.show(Image.CONFUSED)\n        sleep(1500)\n    if accelerometer.was_gesture('face up'):\n        display.show(Image.HAPPY)\n    if accelerometer.was_gesture('left'):\n        display.show('<')\n        music.play(music.JUMP_UP)\n    if accelerometer.was_gesture('right'):\n        display.show('>')\n        music.play(music.JUMP_DOWN)\n",onMount:this.handleEditorDidMount.bind(this),theme:"light",options:{minimap:{enabled:!1},fontSize:18},wrapperClassName:"APIDemo-code"}),Object(Y.jsx)("textarea",{value:this.state.output,readOnly:!0,className:"APIDemo-output"})]})]})}},{key:"connect",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n,r=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t;case 2:n=e.sent,e.t0=n.kind,e.next="ConnectionFailure"===e.t0?6:"MicrobitConnection"===e.t0?8:11;break;case 6:return alert(n.reason),e.abrupt("return",!1);case 8:return this.setState({connection:n}),n.disconnection.then(Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:alert("Serial disconnected"),r.setState({connection:null},Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.connect(B());case 2:alert("Serial reconnected");case 3:case"end":return e.stop()}}),e)}))));case 2:case"end":return e.stop()}}),e)})))),e.abrupt("return",!0);case 11:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"onLoad",value:function(e){var t,n=this.state.editor;if(null!=n){var r=n.getSelection();if(null!=r){var a=r.getPosition(),i={startLineNumber:a.lineNumber,endLineNumber:a.lineNumber,startColumn:a.column,endColumn:a.column};null===(t=n.getModel())||void 0===t||t.pushEditOperations([r],[{range:i,text:e}],(function(e){return null})),n.focus()}else alert("selection is null")}else alert("Editor is not loaded")}},{key:"onStart",value:function(){var e=Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.connect(C());case 2:if(e.sent){e.next=5;break}return e.next=5,this.connect(P());case 5:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"onExec",value:function(){var e=Object(l.a)(u.a.mark((function e(t){var n=this;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.forEach((function(e){switch(e.kind){case"NormalOutput":n.setState({output:e.outputChunk});break;case"ResetPressed":console.log("ResetPressed");break;case"ErrorMessage":"KeyboardInterrupt"!==e.type&&alert("Error on line "+e.line+":\n"+e.type+": "+e.message)}}));case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()},{key:"onFlash",value:function(){var e=Object(l.a)(u.a.mark((function e(t){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("onFlash"),null===this.state.connection){e.next=10;break}return e.t0=this,e.next=5,this.state.connection.interact.flash(t);case 5:return e.t1=e.sent,e.next=8,e.t0.onExec.call(e.t0,e.t1);case 8:e.next=11;break;case 10:alert("No device is connected. Press 'Start' to connect a device.");case 11:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"onRun",value:function(){var e=Object(l.a)(u.a.mark((function e(t){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("onFlash"),null===this.state.connection){e.next=10;break}return e.t0=this,e.next=5,this.state.connection.interact.execute(t);case 5:return e.t1=e.sent,e.next=8,e.t0.onExec.call(e.t0,e.t1);case 8:e.next=11;break;case 10:alert("No device is connected. Press 'Start' to connect a device.");case 11:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"onReboot",value:function(){var e=Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("onReboot"),null===this.state.connection){e.next=10;break}return e.t0=this,e.next=5,this.state.connection.interact.reboot();case 5:return e.t1=e.sent,e.next=8,e.t0.onExec.call(e.t0,e.t1);case 8:e.next=11;break;case 10:alert("No device is connected. Press 'Start' to connect a device.");case 11:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"onInterrupt",value:function(){var e=Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null===this.state.connection){e.next=5;break}return e.next=3,this.state.connection.interact.interrupt();case 3:e.next=6;break;case 5:alert("No device is connected. Press 'Start' to connect a device.");case 6:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()}]),n}(i.a.Component);n(492);o.a.render(Object(Y.jsx)(i.a.StrictMode,{children:Object(Y.jsx)(H,{})}),document.getElementById("root"))}},[[493,1,2]]]);
//# sourceMappingURL=main.11faa9e9.chunk.js.map
const config={appUrl:"",scenesRootDir:"scenes-hydro/",sceneSuffix:".glb",metadataSuffix:".meta",previewImageSuffix:".jpg",popupTextLengthLimit:200,autoplay:!0,displaySplashImage:!1,pauseEnabled:!1,fullscreenEnabled:!0,loaderFadeOutAnimation:!0,guiEnabled:!0,owlEnabled:!0,mobileFlagsEnabled:!0,mobileCanvasDiagonalLimit:1200,sceneLogoEnabled:!0,loaderLogoEnabled:!0,disableFlags:!1,displayColliders:!1,openSceneInNewWindow:!1,newWindowName:"hydro",guiDataConfigFilePath:"data-hydro/config.json",htmlRootDir:"data-hydro/html/",
gaPrefix:"hydro",gaToken:""};const sceneMapping={hydropower:"areal","francis-turbine":"francis",generator:"generator","kaplan-turbine":"kaplan","pumped-storage":"nadrz","power-house":"strojovna"};class Parameters{static getValue(a){a=a.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");a=(new RegExp("[\\?&]"+a+"=([^&#]*)")).exec(location.search);return null==a?null:decodeURIComponent(a[1].replace(/\+/g," "))}static getString(a,b=""){a=Parameters.getValue(a);return null==a?b:a}static getInt(a,b=0){a=Parameters.getValue(a);return null==a?b:parseInt(a)}static getBool(a,b=!1){a=Parameters.getValue(a);return null==a?b:"0"!==a}static getFloat(a,b=0){a=Parameters.getValue(a);return null==a?b:parseFloat(a)}}
;class FileUtils{static loadFile(a,b){const c=new XMLHttpRequest;c.overrideMimeType("application/json");c.open("GET",a,!0);c.onreadystatechange=()=>{4===c.readyState&&200===c.status?b(c.responseText):4===c.readyState&&b(null)};c.send(null)}};class SceneMetadata{constructor(a,b){FileUtils.loadFile(a,c=>{null!=c?(this.rawData=c,this.data=JSON.parse(c),b(!0)):b(!1)})}get cameraSetup(){return null!=this.data&&null!=this.data.cameraSetup?this.data.cameraSetup:null}};class Flag{constructor(a,b,c,d,e,g,m,k){this._flagId=a;this._label=b;this._text=c;this._direction=d;this._length=e;this._position=g;this._side=m;this._pointOnly=k;this._visible=!1;this._insideCameraFrustrum=this._shouldUpdateVisibility=!0;GuiFlags.initFlag(a,b,c,d,e,m,k)}set insideCameraFrustrum(a){this._insideCameraFrustrum=a}updateGuiPosition(a,b){this._left=a;this._top=b;GuiFlags.updateFlagPosition(this._flagId,this._left,this._top)}updateFlagVisibility(a,b){this._shouldUpdateVisibility&&(this._shouldUpdateVisibility=
!1,this._insideCameraFrustrum?a.getPhysicsEngine().raycast(b.position,this._position).hasHit?this.hide():this.show():this.hide(),setTimeout(()=>{this._shouldUpdateVisibility=!0},200))}updateZIndex(a){GuiFlags.updateZIndex(this._flagId,a)}hide(){this._visible&&(this._visible=!1,GuiFlags.hideFlag(this._flagId))}show(){this._visible||(this._visible=!0,GuiFlags.showFlag(this._flagId))}updateDisplayStyle(a){GuiFlags.updateDisplayStyle(this._flagId,a)}get flagId(){return this._flagId}get label(){return this._label}get text(){return this._text}get direction(){return this._direction}get length(){return this._length}get position(){return this._position}}
;class FlagsManager{constructor(a,b){this._scene=a;this._flags=[];this._touchesLength=0;this._pointsOnly=b}setPointsOnly(a){this._pointsOnly=a;for(let b=0;b<this._flags.length;b++)this._flags[b].updateDisplayStyle(a)}initFlags(a){for(let c=0;c<a.length;c++){var b=a[c];const d="flag_"+c,e=new BABYLON.Vector3(b.position.x,b.position.y,b.position.z);b=new Flag(d,b.label?b.label:"",b.text?b.text:"",b.direction?b.direction:"up",b.length?b.length:1,e,b.side?b.side:"right",this._pointsOnly);this._flags.push(b)}this._attachHandlers()}updateFlagsGuiPositions(a,
b){for(let d=0;d<this._flags.length;d++){const e=this._flags[d];var c=e.position;let g=BABYLON.Matrix.Identity(),m=a.getTransformMatrix();c=BABYLON.Vector3.Project(c,g,m,b.viewport);e.insideCameraFrustrum=1>=c.z;e.updateGuiPosition(c.x,c.y)}}updateFlagsVisibility(a,b){for(let c=0;c<this._flags.length;c++)this._flags[c].updateFlagVisibility(a,b)}updateFlagsZIndexes(){let a=[];for(var b=0;b<this._flags.length;b++)a.push([this._flags[b],this._flags[b]._top]);a.sort(function(c,d){return c[1]-d[1]});for(b=
0;b<a.length;b++)a[b][0].updateZIndex(b)}_attachHandlers(){let a=this;const b=document.getElementsByClassName("label"),c=document.getElementById("renderCanvas");for(let g=0;g<b.length;g++){let m,k=0;var d=null,e=null;b[g].addEventListener("pointerdown",function(){for(let l=0;l<b.length;l++)b[g]!==b[l]&&a._hasText(b[l])&&(b[l].style.pointerEvents="none")});b[g].addEventListener("pointerup",function(l){a._enableLabelsPointerEvents();const {modalTitle:f,modalText:h}=this.dataset;""!==h&&h.startsWith("scene:")?
(l=h.replace("scene:","").trim(),App.instance.openScene(l)):""!==h&&h.startsWith("html:")?(l=h.replace("html:","").trim(),App.instance.openHtmlSlidePanel(f,l)):""!==h&&(0<=config.popupTextLengthLimit&&h.length>config.popupTextLengthLimit||h.includes("a href")?App.instance.openSlidePanel(f,h):App.instance.openInfoPopup(f,h))});for(let l in b[g])l.startsWith("on")&&b[g].addEventListener(l.slice(2),f=>{"pointerdown"===f.type&&(m=f,k=0,d=f.clientX,e=f.clientY);"pointerup"===f.type&&(m=void 0,k=0);"pointermove"===
f.type&&void 0!==m&&(k+=Math.sqrt(Math.pow(e-f.clientY,2)+Math.pow(d-f.clientX,2)),d=f.clientX,e=f.clientY);void 0!==m&&("pointerleave"===f.type||5<k)&&(c.dispatchEvent(m),m=void 0,k=0);if((f instanceof MouseEvent||f instanceof PointerEvent)&&"pointerup"!==f.type){let h;h="wheel"===f.type?"Firefox"===window.browserInfo.browser.name?new WheelEvent(f.type,{deltaY:f.deltaY}):new WheelEvent(f.type,f):new f.constructor(f.type,f);"pointerdown"!==f.type&&c.dispatchEvent(h)}})}c.addEventListener("pointerup",
function(g){0<a._touchesLength&&a._touchesLength--;0===a._touchesLength&&a._enableLabelsPointerEvents()});document.addEventListener("touchstart",function(g){a._disableLabelsPointerEvents();a._touchesLength=g.touches.length});document.addEventListener("touchend",function(g){0===g.touches.length&&a._enableLabelsPointerEvents()})}_disableLabelsPointerEvents(){const a=document.getElementsByClassName("label");for(let b=0;b<a.length;b++)this._hasText(a[b])&&(a[b].style.pointerEvents="none")}_enableLabelsPointerEvents(){const a=
document.getElementsByClassName("label");for(let b=0;b<a.length;b++)this._hasText(a[b])&&(a[b].style.pointerEvents="auto")}_hasText(a){return!a.classList.contains("label--no-text")}};class SceneManager{constructor(){SceneManager.instance=this;this.canvas=document.getElementById("renderCanvas");this.loadingProgressText=document.getElementById("loadingProgressText");this.engine=new BABYLON.Engine(this.canvas,!0,{},!0);this.engine.runRenderLoop(()=>{this._renderLoop()});window.addEventListener("resize",()=>{this.engine.resize();this._resized()})}loadScene(a,b,c){this.sceneName=a;this.version=b;this.loaderTitle=c||"Loading";this.loadStartTimeMs=Date.now();this.didYouKnowTextDisplayed=
!1;a=config.scenesRootDir+a+config.metadataSuffix+"?v="+b;this._log("LOADING METADATA: "+a);this.metadata=new SceneMetadata(a,d=>{this._metadataLoadedHandler(d)})}createScreenshot(a){if(null!=this.engine&&null!=this.camera){const b=document.getElementById("renderCanvas");BABYLON.Tools.CreateScreenshotUsingRenderTarget(this.engine,this.camera,{width:b.offsetWidth,height:b.offsetHeight,precision:1},null,"image/jpeg",8,!0,a)}}deactivateInput(){null!=this.camera&&(this.camera.detachControl(),this._inputActive=
!1)}activateInput(){null!=this.camera&&(this.camera.attachControl(this.canvas,!0),this._inputActive=!0)}_metadataLoadedHandler(a){a?(this._log("METADATA LOADED"),BABYLON.SceneLoader.ShowLoadingScreen=!1,BABYLON.SceneLoader.Load(config.scenesRootDir,this.sceneName+config.sceneSuffix+"?v="+this.version,this.engine,b=>{this._sceneLoadedHandler(b)},b=>{this._sceneLoadProgressHandler(b)},(b,c,d)=>{this._sceneLoadErrorHandler(b,c,d)})):this._log("METADATA NOT LOADED")}_sceneLoadedHandler(a){this._log("SCENE LOADED");
this.scene=a;this.scene.enablePhysics(new BABYLON.Vector3(0,0,0),new BABYLON.AmmoJSPlugin);this.scene.registerAfterRender(()=>{this._afterRender()});this.checkSceneFullyLoadedIntervalId=setInterval(()=>{this._checkSceneFullyLoaded()},100)}_sceneLoadProgressHandler(a){this._log("PROGRESS:");this._log(a);if(null!=a.lengthComputable&&a.lengthComputable){a=Math.round(a.loaded/a.total*100);if(!this.didYouKnowTextDisplayed){const b=Date.now()-this.loadStartTimeMs;70>=a&&3E3<=b&&(this.didYouKnowTextDisplayed=
!0,App.instance.displayRandomDidYouKnowText())}this.loadingProgressText.innerText=99<a?this.loaderTitle:this.loaderTitle+"\n"+a+" %"}}_sceneLoadErrorHandler(a,b,c){this._log("ERROR: "+b);Stats.sceneLoadingError(this.sceneName,b)}_checkSceneFullyLoaded(){null==this.scene||this.scene.isLoading||(clearInterval(this.checkSceneFullyLoadedIntervalId),this._sceneFullyLoadedHandler())}_sceneFullyLoadedHandler(){this._log("SCENE FULLY LOADED");Stats.sceneLoaded(this.sceneName);this._initEventListeners();this._initCamera();
this._initEnvironment();this._initCollisionModel();setTimeout(()=>{this._hideLoadingScreen();this._initGuiControls();this._initFlagsManager()},1E3)}_initEventListeners(){document.addEventListener("wheel",a=>{this._wheelEventHandler(a)},{passive:!1})}_initGuiControls(){document.getElementById("guiControls").style.display="block"}_initCollisionModel(){const a=config.displayColliders;for(let b=0;b<this.scene.meshes.length;b++){const c=this.scene.meshes[b];c.name.startsWith("box_collider")&&c.checkCollisions?
(this._log("CREATING BoxImpostor FOR MESH: "+c.name),c.isVisible=a,c.physicsImpostor=new BABYLON.PhysicsImpostor(c,BABYLON.PhysicsImpostor.BoxImpostor,{ignoreParent:!0,mass:0,restitution:.8})):c.name.startsWith("sphere_collider")&&c.checkCollisions?(this._log("CREATING SphereImpostor FOR MESH: "+c.name),c.isVisible=a,c.physicsImpostor=new BABYLON.PhysicsImpostor(c,BABYLON.PhysicsImpostor.SphereImpostor,{ignoreParent:!0,mass:0,restitution:.8})):c.name.startsWith("capsule_collider")&&c.checkCollisions?
(this._log("CREATING CapsuleImpostor FOR MESH: "+c.name),c.isVisible=a,c.physicsImpostor=new BABYLON.PhysicsImpostor(c,BABYLON.PhysicsImpostor.CapsuleImpostor,{ignoreParent:!0,mass:0,restitution:.8})):a&&(c.isVisible=!1)}}_initEnvironment(){for(let a=0;a<this.scene.meshes.length;a++){const b=this.scene.meshes[a];b.name.toLowerCase().includes("skybox")&&(b.isVisible=!1)}this.scene.shadowsEnabled=!1}_initCamera(){const a=this._isMobile();var b=new BABYLON.Vector3(0,0,-5);const c=new BABYLON.Vector3(0,
0,0),d=this.metadata.cameraSetup;null!=d&&(b.x=d.position.x,b.y=d.position.y,b.z=d.position.z,c.x=d.target.x,c.y=d.target.y,c.z=d.target.z);const e=BABYLON.Vector3.Distance(b,c);let g=e,m=e,k=.8,l=.3,f=500,h=-1,p=-1,q=-1,r=-1,n="none";null!=d&&(g=0<d.minZoom?d.minZoom:e,m=0<d.maxZoom?d.maxZoom:e,k=d.fov,l=d.minZ,f=d.maxZ,h=null!=d.angleLimitLeft?d.angleLimitLeft:h,p=null!=d.angleLimitRight?d.angleLimitRight:p,q=null!=d.angleLimitUp?d.angleLimitUp:q,r=null!=d.angleLimitDown?d.angleLimitDown:r,n=null!=
d.panning?d.panning:n);this.camera=new BABYLON.ArcRotateCamera("camera",0,0,e,c,this.scene);this.camera.setPosition(b);0<=h&&0<=p&&(this.camera.lowerAlphaLimit=this.camera.alpha-Math.PI/180*h,this.camera.upperAlphaLimit=this.camera.alpha+Math.PI/180*p);0<=q&&0<=r&&(this.camera.lowerBetaLimit=this.camera.beta-Math.PI/180*q,this.camera.upperBetaLimit=this.camera.beta+Math.PI/180*r);this.camera.lowerRadiusLimit=g;this.camera.upperRadiusLimit=m*(a?2:1);this.camera.fov=k;this.camera.minZ=l;this.camera.maxZ=
f;a&&(this.camera.inertia=.7,this.camera.panningInertia=0);b=this._getSceneSize()/15;1>b&&(b=1);this.camera.wheelPrecision=100/b;this.camera.pinchPrecision=200/b;this.camera.pinchToPanMaxDistance=20;this.camera.panningSensibility=(a?100:2E3)/b;"horizontal"===n?this.camera.panningAxis=new BABYLON.Vector3(1,0,1):"vertical"===n?this.camera.panningAxis=new BABYLON.Vector3(0,1,0):"free"===n?this.camera.panningAxis=new BABYLON.Vector3(1,1,0):"sideways"===n?this.camera.panningAxis=new BABYLON.Vector3(1,
0,0):this.camera.panningSensibility=0;this.camera.attachControl(this.canvas,!0);this.scene.activeCamera=this.camera;this._inputActive=!0}_isMobile(){const a=window.browserInfo.os.name.toLowerCase();return"ios"===a||"android"===a||"macos"===a}_getSceneSize(){const a=this.scene.getWorldExtends();return BABYLON.Vector3.Distance(a.min,a.max)}_initFlagsManager(){config.disableFlags||(this.pointsOnly=this._canUpdateFlagsVisibility=!1,config.mobileFlagsEnabled&&(this.pointsOnly=this._computeCanvasDiagonal()<
config.mobileCanvasDiagonalLimit),this.flagsManager=new FlagsManager(this.scene,this.pointsOnly),this.flagsManager.initFlags(this.metadata.data.flags),setTimeout(()=>{this._canUpdateFlagsVisibility=!0},500))}_renderLoop(){null!=this.scene&&null!=this.camera&&this.scene.render()}_afterRender(){null!=this.scene&&null!=this.camera&&null!=this.flagsManager&&(this.flagsManager.updateFlagsGuiPositions(this.scene,this.camera),this._canUpdateFlagsVisibility&&this.flagsManager.updateFlagsVisibility(this.scene,
this.camera),this.flagsManager.updateFlagsZIndexes())}_log(a){null!=console&&console.log(a)}_wheelEventHandler(a){this._inputActive&&a.preventDefault()}_hideLoadingScreen(){const a=document.getElementById("sceneImage");config.loaderFadeOutAnimation?a.classList.add("fadeOut500"):a.style.display="none";document.getElementById("loadingScreen").style.display="none"}_resized(){if(config.mobileFlagsEnabled&&null!=this.flagsManager){let a=this._computeCanvasDiagonal()<config.mobileCanvasDiagonalLimit;a!==
this.pointsOnly&&(this.pointsOnly=a,this.flagsManager.setPointsOnly(this.pointsOnly))}}_computeCanvasDiagonal(){return Math.sqrt(this.canvas.offsetWidth*this.canvas.offsetWidth+this.canvas.offsetHeight*this.canvas.offsetHeight)}};class GuiFlags{static get flagsContainer(){null==GuiFlags._flagsContainer&&(GuiFlags._flagsContainer=document.getElementById("flagsContainer"));return GuiFlags._flagsContainer}static initFlag(a,b,c,d,e,g,m){const k=document.createElement("div");d="up"===d?"flag--up":"flag--down";g="right"===g?"flag--right":"flag--left";const l=c.startsWith("scene:")?"flag--has-scene":"flag--has-info";k.className=`flag flag--hidden ${d} ${g} ${l} ${m?"flag--point-only":"flag--full"}`;k.setAttribute("data-length",e);
k.setAttribute("touch-action","none");e*=150;k.innerHTML=`<div class="dot"></div>
        <div class="line" style="${`height: ${e-11}px;`}"></div>
        <div class="label user-select-none${""===c?" label--no-text":""}" style="${`${"flag--up"===d?"top":"bottom"}: -${e-12}px`}" data-modal-title="${b}" data-modal-text="${c}"><span class="label-text">${b}</span><div class="line-hider"></div></div>`;GuiFlags.flagsContainer.appendChild(k);GuiFlags.flags=GuiFlags.flags?GuiFlags.flags:{};GuiFlags.flags[a]=k}static updateFlagPosition(a,b,c){a=GuiFlags.flags[a];null!=a&&(a.style.left=100*b+"%",a.style.top=100*c+"%")}static updateZIndex(a,b){a=GuiFlags.flags[a];
null!=a&&(a.style.zIndex=b)}static hideFlag(a){GuiFlags.flags[a].classList.remove("flag--visible","animate__fadeIn");GuiFlags.flags[a].classList.add("flag--hidden","animate__fadeOut")}static showFlag(a){GuiFlags.flags[a].classList.remove("flag--hidden","animate__fadeOut");GuiFlags.flags[a].classList.add("flag--visible","animate__fadeIn","animate__animated")}static updateDisplayStyle(a,b){b?(GuiFlags.flags[a].classList.add("flag--point-only"),GuiFlags.flags[a].classList.remove("flag--full")):(GuiFlags.flags[a].classList.add("flag--full"),
GuiFlags.flags[a].classList.remove("flag--point-only"))}};class GuiDetailPanel{constructor(){GuiDetailPanel.instance=this;this.opened=!1}};class Stats{static addAnalytics(){if(config.gaToken){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag("js",new Date);window.gtag("config",config.gaToken);var a=document.createElement("script");a.type="text/javascript";a.async=!0;a.src="https://www.googletagmanager.com/gtag/js?id="+config.gaToken;document.getElementsByTagName("head")[0].appendChild(a)}}static logEvent(a,b){config.gaToken&&(b.appType=config.gaPrefix,window.gtag("event",
a,b))}static sceneOpened(a){Stats.logEvent("open",{sceneName:config.gaPrefix+"_"+a})}static sceneLoaded(a){Stats.logEvent("scene_loaded",{sceneName:config.gaPrefix+"_"+a})}static sceneLoadingError(a,b){Stats.logEvent("scene_loading_error",{sceneName:config.gaPrefix+"_"+a,errorMessage:b})}};class GuiMenu{constructor(){GuiMenu.instance=this;this.opened=!1;this.menuElement=document.getElementById("menu");this.scenes=[];this.scenesStructure=[]}init(a,b){const c=a.scenes;c.forEach(d=>{d.children=[];""===d.parent&&this.scenesStructure.push(d);c.forEach(e=>{d.name===e.parent&&d.children.push(e)})});this.scenes=c;this._buildMenu()}open(){App.instance.sceneManager.deactivateInput();this.opened=!0;this.menuElement.style.display="block";this.menuElement.classList.add("animate__fadeInDown");this.menuElement.classList.remove("animate__fadeOutUp")}close(){App.instance.sceneManager.activateInput();
this.opened=!1;this.menuElement.classList.add("animate__fadeOutUp");this.menuElement.classList.remove("animate__fadeInDown")}_buildMenu(){this._buildTreeMenu();this._buildImageMenu()}_buildTreeMenu(){let a=this._buildTreeMenuContent(this.scenesStructure[0]);document.getElementById("treeMenu").insertAdjacentHTML("beforeend",a)}_buildTreeMenuContent(a,b=0){let c="";0===b&&(c+=`<ul class="tree-menu level-${b}">`);c+=`<li class="tree-menu__item level-${b}"><a class="tree-menu__title level-${b}" onclick="App.instance.openScene('${a.name}')">${a.title}</a>`;
0<a.children.length&&(c+=`<ul class="tree-menu level-${b+1}">`,a.children.forEach(d=>{c+=this._buildTreeMenuContent(d,b+1)}),c+="</ul>");c+="</li>";0===b&&(c+="</ul>");return c}_buildImageMenu(){const a=document.getElementById("imageMenu");this.scenes.forEach(b=>{b=this._buildImageMenuItem(b);a.insertAdjacentHTML("beforeend",b)})}_buildImageMenuItem(a){return`<div class="col-12 col-sm-6 col-lg-4 col-xxl-3">
            <div class="image-menu-item mb-4">
                <a class="image-menu-item__link" onclick="App.instance.openScene('${a.name}')">
                    <div class="image-menu-item__content-container d-flex flex-column align-items-center">
                        <div class="image-menu-item__image-container mb-2">
                            <img class="image-menu-item__image img-fluid" src="${a.image}" alt="${a.title}">
                        </div>
                        <div class="image-menu-item__title text-uppercase">
                            ${a.title}
                        </div>
                    </div>
                </a>
            </div>
        </div>`}};class SlidePanel{constructor(a,b,c){this.element=a;this.contentElement=a.getElementsByClassName("slide-panel-dialog")[0];this.contentElement.style.transition="all .4s, width 0ms";this.title=b;this.content=c;this.closeBtn=this.contentElement.getElementsByClassName("btn-close")[0];this._addContent();this._attachHandlers();window.slidePanelInstance=this}open(){const a=new Event("open.slidepanel");this.element.dispatchEvent(a);this.element.classList.add("open");setTimeout(()=>{const b=new Event("openend.slidepanel");
this.element.dispatchEvent(b);document.addEventListener("click",this._outsideClickHandler)},400)}close(){const a=new Event("close.slidepanel");this.element.dispatchEvent(a);this.element.classList.remove("open");this._removeHandlers();setTimeout(()=>{const b=new Event("closed.slidepanel");this.element.dispatchEvent(b)},400)}_addContent(){this.contentElement.getElementsByClassName("slide-panel__title")[0].innerHTML=this.title;this.contentElement.getElementsByClassName("slide-panel__content")[0].innerHTML=
this.content}_attachHandlers(){this.closeBtn.addEventListener("click",this._closeBtnClickHandler)}_removeHandlers(){this.closeBtn.removeEventListener("click",this._closeBtnClickHandler);document.removeEventListener("click",this._outsideClickHandler)}_closeBtnClickHandler(){null!=window.slidePanelInstance&&window.slidePanelInstance.close()}_outsideClickHandler(a){null!=window.slidePanelInstance&&!window.slidePanelInstance.contentElement.contains(a.target)&&window.slidePanelInstance.element.classList.contains("open")&&
window.slidePanelInstance.close()}};class GuiManager{constructor(){GuiManager.instance=this;this.sceneName="";this.dataConfig=null;this.menuOpened=!1;this.guiMenu=new GuiMenu;this.guiDetailPanel=new GuiDetailPanel}init(a,b,c){this.sceneName=b;FileUtils.loadFile(a,d=>{if(null!=d){this.dataConfig=JSON.parse(d);document.getElementById("gui").style.display="block";if(null==this.sceneName||""===this.sceneName)this.sceneName=this.startupSceneName;this._renderHeadMetadata();this._renderMoodleLink();this.guiMenu.init(this.dataConfig,this.sceneName);
this._generateBreadcrumbs();this._initMobileSceneHeader();c(!0)}else c(!1)})}get startupSceneName(){return null!=this.dataConfig&&null!=this.dataConfig.startupSceneName?this.dataConfig.startupSceneName:""}getSceneConfig(a){if(null==a||null==this.dataConfig||null==this.dataConfig.scenes)return null;for(let b=0;b<this.dataConfig.scenes.length;b++){const c=this.dataConfig.scenes[b];if(c.name===a)return c}return null}getRandomDidYouKnowText(){if(null==this.dataConfig||null==this.dataConfig.didYouKnowTexts)return"";
const a=this.dataConfig.didYouKnowTexts;return 0>=a.length?"":a[Math.floor(Math.random()*a.length)]}backButtonClickHandler(){const a=this.getSceneConfig(this.sceneName);null!=a.parent&&""!==a.parent&&App.instance.openScene(a.parent)}menuButtonClickHandler(){this.menuOpened?this.closeMenu():this.openMenu()}openMenu(){this.menuOpened=!0;this._setMenuButtonOpened(!0);this.guiMenu.open()}closeMenu(){this.menuOpened=!1;this._setMenuButtonOpened(!1);this.guiMenu.close()}_initMobileSceneHeader(){const a=
document.getElementById("sceneTitle"),b=document.getElementById("backButton"),c=this.getSceneConfig(this.sceneName);null!=c&&(a.innerText=c.title,null==c.parent||""===c.parent)&&(b.style.display="none",a.style.paddingLeft="20px")}_generateBreadcrumbs(){const a=document.getElementById("breadcrumbsList");let b=[];var c=this.sceneName;do{var d=this.getSceneConfig(c);null!=d&&(b.push(d),c=d.parent)}while(null!=d);b=b.reverse();for(c=0;c<b.length;c++){var e=b[c];d=e.name;e=e.title||"N/A";const g=document.createElement("li");
g.innerHTML="<a href='#' onclick='App.instance.openScene(\""+d+"\")'>"+e+"</a>";a.append(g)}}_setMenuButtonOpened(a){a?document.getElementById("menuButtonAnimation").classList.add("open"):document.getElementById("menuButtonAnimation").classList.remove("open")}_renderHeadMetadata(){this._renderTitle();this._renderDescription();this._renderOGImage()}_renderMoodleLink(){var a=this.dataConfig.moodleUrl;if(void 0!==a){document.getElementById("moodleLink").href=a;const b=document.getElementById("moodleOwl");
a=document.getElementById("moodleOwlImg");b.classList.add("animate__animated","animate__flipInY");b.classList.remove("d-none");a.addEventListener("click",()=>{window.matchMedia("(hover: hover) and (pointer: fine)").matches||(b.classList.contains("open")?b.classList.remove("open"):b.classList.add("open"))});document.addEventListener("click",c=>{document.getElementById("moodleOwl").contains(c.target)||b.classList.remove("open")})}}_renderTitle(){var a=this.getSceneConfig(this.sceneName).title;void 0!==
a&&(document.title=`3D Model - ${a} - Energy Encyclopedia`,a=document.createElement("meta"),a.name="og:title",a.content=document.title,document.getElementsByTagName("head")[0].appendChild(a))}_renderDescription(){var a=this.getSceneConfig(this.sceneName);a=void 0!==a.description?a.description:this.dataConfig.description;if(void 0!==a){const b=document.createElement("meta");b.name="description";b.content=a;const c=document.createElement("meta");c.name="og:description";c.content=a;document.getElementsByTagName("head")[0].appendChild(b);
document.getElementsByTagName("head")[0].appendChild(c)}}_renderOGImage(){const a=this.getSceneConfig(this.sceneName).image;if(void 0!==a){const b=document.createElement("meta");b.name="og:image";b.content=a;document.getElementsByTagName("head")[0].appendChild(b)}}};class App{constructor(){App.instance=this;this.version=this.sceneName="";this.sceneManager=this.guiManager=null;const a=bowser.getParser(window.navigator.userAgent);window.browserInfo=a.getResult();this._initListeners()}init(){Stats.addAnalytics();this.sceneName=Parameters.getString("scene");this.version=Parameters.getString("v");this._initMode();this._overrideConfigFromURLParameters();this._initScreenfull();null!=sceneMapping[this.sceneName]&&(this.sceneName=sceneMapping[this.sceneName]);null!==
this.sceneName&&""!==this.sceneName&&Stats.sceneOpened(this.sceneName);config.loaderLogoEnabled||(document.getElementById("loaderLogo").style.display="none");config.sceneLogoEnabled||(document.getElementById("sceneLogoContainer").style.display="none");if(config.displaySplashImage){const a=config.scenesRootDir+(this.sceneName+config.previewImageSuffix);document.getElementById("sceneImage").style.backgroundImage="url('"+a+"')";document.getElementById("sceneImageCover").style.opacity="15%"}config.pauseEnabled&&
(document.getElementById("pauseButton").style.display="block");screenfull.isEnabled&&config.fullscreenEnabled&&(document.getElementById("fullscreenButton").style.display="block");config.autoplay?this.play():document.getElementById("boot").style.display="flex"}play(){document.getElementById("boot").style.display="none";document.getElementById("loadingScreen").style.display="block";config.owlEnabled||(document.getElementById("moodleOwl").style.display="none");config.guiEnabled?(this.guiManager=new GuiManager,
this.guiManager.init(config.guiDataConfigFilePath,this.sceneName,a=>{if(a){if(null==this.sceneName||""===this.sceneName)this.sceneName=this.guiManager.startupSceneName;this._looadScene()}else alert("Nelze na\u010d\u00edst datovou konfiguraci aplikace: "+config.guiDataConfigFilePath)})):this._looadScene()}openInfoPopup(a,b){document.getElementById("textModalTitle").innerText=a;document.getElementById("textModalText").innerText=b;document.getElementById("textModal").addEventListener("show.bs.modal",
function(){SceneManager.instance.deactivateInput()});(new bootstrap.Modal(document.getElementById("textModal"))).show();document.getElementById("textModal").addEventListener("hide.bs.modal",function(){SceneManager.instance.activateInput()})}openSlidePanel(a,b){a=new SlidePanel(document.getElementById("slidePanel"),a,b);let c=a.element;c.addEventListener("open.slidepanel",function e(){SceneManager.instance.deactivateInput();c.removeEventListener("open.slidepanel",e)});c.addEventListener("close.slidepanel",
function g(){SceneManager.instance.activateInput();c.removeEventListener("close.slidepanel",g)});a.open()}openHtmlSlidePanel(a,b){FileUtils.loadFile(config.htmlRootDir+b+".html",c=>{null!=c&&App.instance.openSlidePanel(a,c)})}fullscreenOn(){screenfull.isEnabled&&screenfull.request()}fullscreenOff(){screenfull.exit()}pause(){const a=document.getElementById("guiControls"),b=document.getElementById("pause");a.style.display="none";b.style.display="block";null!=SceneManager.instance&&SceneManager.instance.deactivateInput()}resume(){const a=
document.getElementById("guiControls"),b=document.getElementById("pause");a.style.display="block";b.style.display="none";null!=SceneManager.instance&&SceneManager.instance.activateInput()}generateSceneUrl(a){let b=a;for(const c in sceneMapping)if(sceneMapping[c]===a){b=c;break}a=window.location.origin+window.location.pathname;null!=config.appUrl&&""!==config.appUrl&&(a=config.appUrl);return a+"?scene="+b}openScene(a){const b=this.generateSceneUrl(a);config.openSceneInNewWindow?(this.sceneManager.deactivateInput(),
window.open(b,config.newWindowName),setTimeout(()=>{this.sceneManager.activateInput()},200)):(a=document.getElementById("sceneImage"),a.classList.remove("fadeOut500"),a.classList.add("fadeIn300"),document.getElementById("guiControls").classList.add("fadeOut200"),document.getElementById("flagsContainer").classList.add("fadeOut200"),setTimeout(()=>{window.location.href=b},350))}displayRandomDidYouKnowText(){let a="";null!=this.guiManager&&(a=this.guiManager.getRandomDidYouKnowText());if(null!=a&&""!==
a){const b=document.getElementById("didYouKnowText");null!=b&&(b.classList.remove("fadedOut"),b.classList.add("fadeIn500"),b.innerText="Did You Know ?\n"+a)}}_looadScene(){let a="";if(null!=this.guiManager){let b=this.guiManager.getSceneConfig(App.instance.sceneName);null!=b&&null!=b.loaderTitle&&(a=b.loaderTitle)}setTimeout(()=>{Ammo().then(function(){App.instance.sceneManager=new SceneManager;App.instance.sceneManager.loadScene(App.instance.sceneName,App.instance.version,a)})},100)}_initMode(){"iframe"===
Parameters.getString("mode","")&&(config.autoplay=!1,config.displaySplashImage=!0,config.pauseEnabled=!0,config.fullscreenEnabled=!0,config.guiEnabled=!1,config.sceneLogoEnabled=!1,config.loaderLogoEnabled=!1,config.openSceneInNewWindow=!0)}_overrideConfigFromURLParameters(){for(let a in config){let b="";switch(typeof config[a]){case "string":b="getString";break;case "boolean":b="getBool";break;case "number":b="getFloat"}""!==b&&(config[a]=Parameters[b](a,config[a]))}}_initListeners(){window.addEventListener("unload",
function(){});document.addEventListener("keydown",function(a){"Escape"===a.key&&config.pauseEnabled&&window.app.pause();"p"===a.key&&config.displaySplashImage&&null!=App.instance&&window.app.sceneManager.createScreenshot(App.instance.sceneName+".jpg")})}_initScreenfull(){if(screenfull.isEnabled&&config.fullscreenEnabled)screenfull.on("change",function(){if(screenfull.isFullscreen){var a=document.getElementById("fullscreenButton"),b=document.getElementById("fullscreenExitButton");a.style.display="none";
b.style.display="block"}else a=document.getElementById("fullscreenButton"),b=document.getElementById("fullscreenExitButton"),a.style.display="block",b.style.display="none"})}};window.app=new App;app.init();
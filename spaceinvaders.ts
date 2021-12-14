import { fromEvent, interval, timer } from "rxjs";
import { map, filter, mergeMap, take, scan, merge, repeatWhen, takeUntil} from 'rxjs/operators'


function spaceinvaders() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code! 
    
    
  const BULLET_SVG=`<rect height="20" width="10"></rect>`;
  const SPEEDUP_SVG=`	<g>
  <g id="Layer_1">
    <circle class="st0" cx="142.7" cy="142.7" r="135.7"/>
  </g>
  <g id="Layer_2">
    <polygon class="st1" points="256.1,142.7 156.7,85.3 156.7,134.6 71.3,85.3 71.3,200.1 156.7,150.8 156.7,200.1 			"/>
  </g>
</g>`;
  //How the aliens look(From wikipedia)  
  const ALIEN_SVG=`
<rect x="84" fill="#FF0000" width="42" height="42"/>
<rect x="126" y="42" fill="#FF0000" width="42" height="42"/>
<rect x="84" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="42" y="126" fill="#FF0000" width="42" height="42"/>
<rect y="84" fill="#FF0000" width="42" height="42"/>
<rect y="42" fill="#FF0000" width="42" height="42"/>
<rect y="126" fill="#FF0000" width="42" height="42"/>
<rect x="42" y="168" fill="#FF0000" width="42" height="42"/>
<rect y="168" fill="#FF0000" width="42" height="42"/>
<rect x="42" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="84" y="126" fill="#FF0000" width="42" height="42"/>
<rect x="84" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="84" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="84" y="252" fill="#FF0000" width="42" height="42"/>
<rect x="42" y="294" fill="#FF0000" width="42" height="42"/>
<rect x="126" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="168" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="210" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="252" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="294" y="42" fill="#FF0000" width="42" height="42"/>
<rect x="336" fill="#FF0000" width="42" height="42"/>
<rect x="294" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="336" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="420" y="84" fill="#FF0000" width="42" height="42"/>
<rect x="420" y="42" fill="#FF0000" width="42" height="42"/>
<rect x="420" y="126" fill="#FF0000" width="42" height="42"/>
<rect x="420" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="336" y="126" fill="#FF0000" width="42" height="42"/>
<rect x="336" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="336" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="378" y="126" fill="#FF0000" width="42" height="42"/>
<rect x="378" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="378" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="336" y="252" fill="#FF0000" width="42" height="42"/>
<rect x="378" y="294" fill="#FF0000" width="42" height="42"/>
<rect x="126" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="168" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="210" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="252" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="294" y="210" fill="#FF0000" width="42" height="42"/>
<rect x="126" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="168" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="210" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="252" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="294" y="168" fill="#FF0000" width="42" height="42"/>
<rect x="168" y="126" fill="#FF0000" width="42" height="42"/>
<rect x="210" y="126" fill="#FF0000" width="42" height="42"/>
<rect x="252" y="126" fill="#FF0000" width="42" height="42"/>
`

//Some constants for the aliens
const 
  ALIEN_HEIGHT=40,
  ALIEN_WIDTH=40,
  SPACE_BETWEEN_ALIENS=15,
  ALIENS_PER_ROW=8,
  TOTAL_ROWS=4,
  ALIEN_VERTICAL_SPEED=20,
  ALIEN_HORIZONTAL_SPEED=20

//Constants for the ship
const
  SHIP_SPEED=3;

//Constants for the bullets
const
  FRIENDLY_BULLET_SPEED=-14,
  ALIEN_BULLET_SPEED=5

//Constants for power ups
const 
  POWER_UP_VERTICAL_SPEED=1

//A function to create aliens and position them according to their index
  function createAliens(i:number):Body{
    return {
      id: `alien${i}`,                                                      //id of this particular alien
      x:60+(i%ALIENS_PER_ROW)*(ALIEN_WIDTH+SPACE_BETWEEN_ALIENS),                //The x coordinate of the alien calculated according to the constants and the index
      y:40+Math.floor(i/ALIENS_PER_ROW)*(ALIEN_HEIGHT+SPACE_BETWEEN_ALIENS),     //The y coordinate of the alien calculated according to the constants and the index
      createTime:0,                                                         //All the aliens are created at the same time(beginning)
      verticalSpeed:ALIEN_VERTICAL_SPEED,                                   //The vertical speed of the aliens(How much they move when going downwards)
      horizontalSpeed:ALIEN_HORIZONTAL_SPEED,                                                   //The horizontal speed of the aliens(For moving left and right)
      type:'alien',                                                         //Type of the body
      move:true,
      width:ALIEN_WIDTH,
      height:ALIEN_HEIGHT,
    }
  }
  //Creating all aliens
  const startAliens = [...Array(ALIENS_PER_ROW*TOTAL_ROWS)].map((_,i)=>createAliens(i))    


  //Classes to differentiate between different instances of events(Tick, Move, and Shoot)
  class Tick { constructor(public readonly elapsed:number) {} }
  class Move { constructor(public readonly direction:number) {} }
  class Shoot { constructor() {} }
  class Reset { constructor() {} }

  //Two types of keyEvents allowed: "key up" and "key down"
  type Event = 'keydown' | 'keyup';
  //The keys to control the ship
  type Key = 'ArrowLeft' | 'ArrowRight'|'Space'|'KeyR';
  //Possible alien movement directions
  type AlienDirection = 'left' | 'right'|'down';

  //Possible Body Types
  type BodyType='friendlyBullet' | 'alienBullet' | 'alien' | 'ship' | 'powerup';

  //The pattern by which the aliens move
  const alienMovePattern: AlienDirection []=['right','right','left','left','down'];



  //A helper function to observe various keys
  const observeKey = <T>(eventName:string, k:Key, result:()=>T)=>
    fromEvent<KeyboardEvent>(document,eventName)
      .pipe(
        filter(({code})=>code === k),
        // filter(({repeat})=>!repeat),
        map(result));


  //Creating a body type for various in game objects(Ship,Bullets,Aliens)
  type Body = Readonly<{
    id:string,
    x:number, 
    y:number,
    move:boolean,
    horizontalSpeed?:number,
    verticalSpeed?:number,
    type:BodyType,
    width:number,
    height:number,
    createTime:number
  }>
  //A state data type to keep track of the game state
  type State=Readonly<{
    time:number,
    levelStartTime:number,
    currentLevelTime:number,
    ship:Body,
    powerUps:Body[],
    alienMove:number,
    bullets:ReadonlyArray<Body>,
    aliens:ReadonlyArray<Body>,
    exit:ReadonlyArray<Body>,
    objCount:number,
    score:number,
    gameOver:Boolean,
    level:number,
  }>; 

  const createBullet=(s:State)=>(shooter:Body)=>(bulletType:BodyType):Body =>{
    return {
      id: bulletType=='friendlyBullet'?`bullet${s.objCount}`:`alienBullet${s.objCount}`,
      x:bulletType=='friendlyBullet'?s.ship.x+20:shooter.x+20,
      y:bulletType=='friendlyBullet'?s.ship.y:shooter.y,
      createTime:s.time,
      verticalSpeed:bulletType=='friendlyBullet'?FRIENDLY_BULLET_SPEED:ALIEN_BULLET_SPEED,
      horizontalSpeed:0,
      type:bulletType,
      move:true,
      width:10,
      height:20
    }
  }
  //Creates a powerup and positions it where the alien died
  function createPowerUp(createTime:number,objCount:number,alien:Body):Body{
    return {...alien, id: `powerup${objCount}`,createTime:createTime,verticalSpeed:POWER_UP_VERTICAL_SPEED,horizontalSpeed:0,type: 'powerup',width:30,height:30}
  }
  //Decides randomly(with low probability) whether a powerup should be dropped for this alien
  function dropPowerUps(s:State,deadAliens:Body[]){ 
    return deadAliens.filter(_=>Math.random()<0.05).map(alien=>{
      return createPowerUp(s.time,s.objCount,alien);
    });
  }


  //Handles all collisions in the game(if any)
  const handleCollisions = (s:State) => {
    const
      //A funtion to check if any two bodies are colliding(Rectangle collision)
      bodiesCollided = ([a,b]:[Body,Body]) => (((a.x < b.x+b.width) && (a.x+a.width > b.x) && (a.y+a.height > b.y) && (a.y < b.y+b.height))),
      //A boolean to know if the ship has collided with a bullet or alien
      shipCollided = s.aliens.filter(a=>bodiesCollided([s.ship,a])).concat(s.bullets.filter(b=>bodiesCollided([s.ship,b])).filter((bullet)=>bullet.type!='friendlyBullet')).length > 0,
      //An array of pairs of all aliens and bullets
      allBulletsAndAliens = (s.bullets).flatMap(b=> s.aliens.map(r=>([b,r]))).filter(([bullet,_])=>bullet.type=='friendlyBullet'),
      //An array of pairs of all aliens and bullets that have collided with each other
      collidedBulletsAndAliens = allBulletsAndAliens.filter(bodiesCollided),
      //All collided bullets
      collidedBullets = collidedBulletsAndAliens.map(([bullet,_])=>bullet),
      //All collided aliens
      collidedAliens = collidedBulletsAndAliens.map(([_,alien])=>alien),
      //All collided powerups(with the ship)
      collidedPowerUps=s.powerUps.filter(p=>bodiesCollided([s.ship,p])),
      //Whether the ship has collected the powerup
      shipPowerUp=collidedPowerUps.length>0,
      //Whether the aliens have won(reached the bottom of the screen)
      alienTakeover=s.aliens.filter(a=>{return a.y+a.height>=600}).length>0
      // search for a body by id in an array
      const not = <T>(f:(x:T)=>boolean)=>(x:T)=>!f(x)
      const elem = (a:ReadonlyArray<Body>) => (e:Body) => a.findIndex(b=>b.id === e.id) >= 0,
      // array a except anything in b
      except = (a:ReadonlyArray<Body>) => (b:Body[]) => a.filter(not(elem(b)))
    return <State>{
      ...s,
      bullets: except(s.bullets)(collidedBullets),
      powerUps:(except(s.powerUps)(collidedPowerUps)).concat(dropPowerUps(s,collidedAliens)),
      ship:shipPowerUp?{...s.ship,horizontalSpeed:SHIP_SPEED*2}:s.ship,
      aliens: except(s.aliens)(collidedAliens),
      exit: s.exit.concat(collidedBullets,collidedAliens,collidedPowerUps),
      score:s.score+collidedAliens.length,
      gameOver: shipCollided||alienTakeover
    }
  }





  //Decides randomly which alien would shoot a bullet and creates a new bullet from the alien position
  const shootAtShip=(s:State):State=>{
    const shooterAlien=Math.floor(Math.random()*s.aliens.length)
    const newState= {...s,
    bullets:s.bullets.concat([ createBullet(s)(s.aliens[shooterAlien])("alienBullet")  ]),
    objCount:s.objCount+1
    };
    return newState;
  }
  const moveAliens = (s:State)=>(direction:AlienDirection)=>{
    s=direction=='right'?{...s,aliens:s.aliens.map(alien=>moveObj(alien)(1))}:
    direction=='left'?{...s,aliens:s.aliens.map(alien=>moveObj(alien)(-1))}:
    direction=='down'?{...s,aliens:s.aliens.map(alien=>moveObj(alien)(0))}:
    s
    s={...s,
    alienMove:s.alienMove===5?0:s.alienMove+1
    }
    return s;
  }

  //Handles the state of the game on every tick
  //Takes care of time dependent events such as alien movement and shooting
  //Also handles the bullets that should expire(should be removed from the game)
  const tick = (s:State,elapsed:number) => {
    s={...s,currentLevelTime:elapsed-(s.levelStartTime+1)};         //Updates the current level time
    s=s.currentLevelTime%50===0?shootAtShip(s):s;                   //Decides whether it is time to shoot at the ship
    s=s.currentLevelTime%(Math.floor(100/s.level))===0?moveAliens(s)(alienMovePattern[s.alienMove]):s;  //Decides whether it is time to move the aliens
    const not = <T>(f:(x:T)=>boolean)=>(x:T)=>!f(x),
    //Expired items(bullets, poweups)(Gone out of screen) 
      expired = (b:Body)=>(elapsed - b.createTime) > 400,
      expiredBullets:Body[] = s.bullets.filter(expired),
      expiredPowerUps:Body[] = s.powerUps.filter(expired),
    // Bullets still active
      activeBullets = s.bullets.filter(not(expired));
    s={...s, 
      bullets:activeBullets.map(bullet=>moveObj(bullet)(0)), 
      powerUps:s.powerUps.map(powerUp=>moveObj(powerUp)(0)),
      exit:expiredBullets.concat(expiredPowerUps),
      time:elapsed,
    }
    s=handleCollisions(s)           //Check for and handle collisions if any
    return s
  }








  function createShip():Body {
    return {
      id: 'ship',
      x:280,
      y:530,
      move:false,
      horizontalSpeed:SHIP_SPEED,
      verticalSpeed:0,
      type:'ship',
      width:50,
      height:60,
      createTime:0
    }
  }

  //The initial state of the game
  const initialState:State = {
    time:0,
    levelStartTime:0,
    currentLevelTime:0,
    alienMove:0,
    powerUps:[],
    ship:createShip(),
    bullets:[],
    aliens:startAliens,
    exit:[],
    objCount:0,
    score:0,
    level:1,
    gameOver:false
  };








  //Moves various types of objects according to the direction given.
  //Also prevents certain objects going out of screen(Ship)
  const moveObj = (o:Body)=>(direction:number) => <Body>{
    ...o,
    x:o.x<=0 && direction===-1?0:                       //Prevents objects going out from left
    o.x>=600-o.width&&direction===1?600-o.width:        //Prevents objects going out from right
    direction===1||-1?o.x+o.horizontalSpeed*direction:  //Moves object along the x-axis if it won't go out
    o.x,
    y:direction===0?o.y+o.verticalSpeed:o.y,            //Moves objects along the y-axis
  }


  
  //Updates the position and existence of a body(Bullet, alien, powerup) on the screen. 
  //Viewbox is needed for svg scaling purposes
  function updateBodyView(svg:Element,bodies:readonly Body[],bodySVG:string,viewBox:string){
    bodies.forEach(body =>{
      const createBodyView=()=>{
        const v = document.createElementNS(svg.namespaceURI, "svg")!;
        v.innerHTML=bodySVG;
        v.setAttribute("width", `${body.width}`)
        v.setAttribute("height",`${body.height}`)
        v.setAttribute("viewBox",viewBox)
        v.setAttribute("id",body.id);
        svg.appendChild(v)
        return v;
      }
      const v = document.getElementById(body.id) || createBodyView();
      v.setAttribute("x",String(body.x))
      v.setAttribute("y",String(body.y))
    })
  }



  //Removes objects from the screen(Expired bullets, dead aliens etc.)
  function removeExitObjects(svg: Element,exit:readonly Body[]) {
    exit.forEach(o=>{
      const v = document.getElementById(o.id);
      if(v) svg.removeChild(v)
    })
  }

  //Updates the position of the ship on the screen
  function updateShipView(shipView:Element,ship:Body){
    shipView.setAttribute('x',
    `${ship.x}`);
   shipView.setAttribute('y',`${ship.y}`);
  }

  //A function to update score on screen
  function updateScore(currentScore:Element,score:number) {
    currentScore.innerHTML=`Score: ${score}`
  }
  //Updates level on the screen
  function updateLevelDisplay(currentLevel:Element,level:number) {
    currentLevel.innerHTML=`Level ${level}`
  }
  //Hide/Show game over text on game over
  function updateGameOverText(gameOver:Boolean, gameOverText:Element,score:number) {
    if(gameOver) {
      gameOverText.classList.remove("hidden")
      const scoreText=document.getElementById("score")
      scoreText.textContent =`Score: ${score}`;
    }else{
      gameOverText.classList.add("hidden")
    }

  }

  //Show/Hide Level Text on game start/levelup
  function updateMessageText(message:string,show:boolean) {
    const messageView=document.getElementById("messageView")
    if(show){
      messageView.classList.remove("hidden")
      messageView.innerHTML = message
    }else{
      messageView.classList.add("hidden")
    }
  }

  //Updates the 'VIEW' part of the game
  function updateView(s:State): void {
    const ship=document.getElementById("spaceship");
    const svg=document.getElementById("game");
    const gameOverText=document.getElementById("gameovertext");
    const currentScore=document.getElementById("currentScore");
    const currentLevel=document.getElementById("level");
    removeExitObjects(svg,s.exit);

    updateScore(currentScore,s.score);
    updateLevelDisplay(currentLevel,s.level);
    updateGameOverText(s.gameOver,gameOverText,s.score);
    if(s.currentLevelTime<10){
      updateMessageText(`Level ${s.level}`,true);
    }else{
      updateMessageText("",false);
      updateShipView(ship,s.ship);
      updateBodyView(svg,s.bullets,BULLET_SVG,"0 0 10 20");
      updateBodyView(svg,s.aliens,ALIEN_SVG,"0 0 462 336");
      updateBodyView(svg,s.powerUps,SPEEDUP_SVG,"0 0 285.4 285.4");
    }
  }






  //Observing various game keys
  const
  startLeftMove = observeKey('keydown','ArrowLeft',()=>new Move(-1)),
  startRightMove = observeKey('keydown','ArrowRight',()=>new Move(1)),
  stopLeftMove = observeKey('keyup','ArrowLeft',()=>new Move(0)),
  stopRightMove = observeKey('keyup','ArrowRight',()=>new Move(0)),
  resetGame= observeKey('keydown','KeyR',()=>new Reset()),
  shoot = observeKey('keydown','Space', ()=>new Shoot())



  //Reduces(Gives) the state of the game using the previous state and the current event
  const reduceState = (s:State, e:Move|Tick|Shoot|Reset)=>
    s.currentLevelTime<10?{...s,currentLevelTime:s.currentLevelTime+0.1}:             //Prevents gameplay while Level info is displayed
    
    //Game Reset
    e instanceof Reset ? {...initialState,                
      exit:s.exit.concat(s.aliens,s.bullets,s.powerUps),
      levelStartTime:s.time
    }:
    s.gameOver?s:                                                                     //Prevents gameplay when Game Over
    s.aliens.length===0?{...initialState,                                             //Level up when all aliens destroyed
      levelStartTime:s.time,
      currentLevelTime:1,
      score:s.score,
      level:s.level+1,
      exit:s.exit.concat(s.bullets,s.powerUps)}:
    e instanceof Move ? {...s,                                                        //Move the ship in case of move Event
      ship: moveObj(s.ship)(e.direction)
    } :
    e instanceof Shoot ? {...s,                                                       //Shoots out bullets from the ship
      bullets: s.bullets.concat([createBullet(s)(s.ship)("friendlyBullet")]),
      objCount: s.objCount + 1
    } : 
    tick(s,e.elapsed);                                                                //Triggers in case not specefic event has occurred


  
  const intervaler=interval(15)
  .pipe(
    map(elapsed=>new Tick(elapsed)),
    merge(
      startLeftMove,startRightMove,stopLeftMove,stopRightMove),
      merge(shoot,resetGame),
    // merge(startThrust,stopThrust),
    scan(reduceState, initialState))
  const subscription=intervaler.subscribe(updateView);




}
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      spaceinvaders();
    }


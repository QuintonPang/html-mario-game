const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// console.log(c)

// function to generate image
const createImage = (src)=>{
    let image = new Image()
    image.src = '../assets/'+src
    return image
}

let pressed = false

class Player{
    constructor(x,y,width,height,velocity){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = velocity;
        // direction
        this.dir=null;
        this.gravity = 5
        this.jump = false
        this.jumpCount = 10

        this.sprite={
            idle:createImage('Idle.png'),
            run:createImage('Run.png'),
            jump: createImage('Jump.png'),
        }

        this.currentSprite = this.sprite.idle

        this.currentFrame = 0
    }

    render(){
        // color to fill rect
        // c.fillStyle = "#ff00ff"
        // c.fillRect(this.x,this.y,this.width,this.height)
        if(this.dir==='left'){
            c.save() // save current state of canvas
            c.scale(-1,1)
            c.drawImage(
                this.currentSprite,
                32 * this.currentFrame, // x position to start cropping
                0,
                32, // width
                32, // height
                -this.x,
                this.y,
                -this.width,
                this.height
            )
            c.restore() // restore latest saved canvas
        }else{
            c.drawImage(
                this.currentSprite,
                32 * this.currentFrame, // x position to start cropping
                0,
                32, // width
                32, // height
                this.x,
                this.y,
                this.width,
                this.height
            )
        }
      
    }

    update(){
        this.y+=this.gravity
       
        if(this.currentSprite===this.sprite.jump){
            this.currentFrame=0
        }
        else if(this.currentFrame>9){
            this.currentFrame = 0
        }else{
            this.currentFrame++
        }

        // player movement
        if(pressed===true){
            if(this.dir==='right'&&this.x<200){
                this.x+=this.velocity
              

            }  
            if(this.dir==='left'&&this.x>100){
                this.x-=this.velocity
            } 
           
        
        }else{
            // this.dir=null
        }

        // jump logic
        if(this.jump === true ){
            // remove gravity when jumping
            // falling is already handled by the jump logic
            this.y -= this.gravity
            if(this.jumpCount>=-10){
                // neg is positive when going up
                let neg = 1
                if(this.jumpCount<0){
                    // neg is negative when going down
                    neg = -1
                }
                // quadratic function
              this.jumpDistance = Math.trunc((this.jumpCount**2)*0.075*neg)
                this.y-= this.jumpDistance
                this.jumpCount-=1
            }else{
                // remove jump flag and reset jump count
                this.jump = false
                this.jumpCount = 10
                this.jumpDistance = 0
            }
        }
   
    }
}

class Platform{
    constructor(x,y,width,height,color,image){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if(image){
            this.width = image.width
            this.height = image.height
        }
        this.color = color;
        this.image = image;
    }


    render(){
        // color to fill rect
        if(this.color!==null){

            c.fillStyle = this.color
            c.fillRect(this.x,this.y,this.width,this.height)
        }else{

            c.drawImage(this.image,this.x,this.y)
        }
    }

    update(){
        // scrolling in opposite direction of player
        if(player.dir==='right'&&player.x>=200&&pressed===true){
            this.x-=player.velocity
        } if(player.dir==='left'&&player.x<=100&&pressed===true){
            this.x+=player.velocity
        } 
     
    }

}

class GenericObject{
    constructor(x,y,image){
        this.x = x-100
        this.y = y
        this.image = image
    }

    render(){
        c.drawImage(this.image,this.x,this.y)
    }

    update(){
        // scrolling in opposite direction of player
        if(player.dir==='right'&&player.x>=200&&pressed===true){
            this.x-=1
        } if(player.dir==='left'&&player.x<=100&&pressed===true){
            this.x+=1
        } 
     
    }
  
}

// declare variables
let player
let platform
let bluePlatforms
let platforms
let genericObjects

const init = () =>{
    let platformImage = createImage('platform.png')
    let backgroundImage = createImage('background.png')

    player = new Player(150,10,32,32,2)
    platform = new Platform(30,70,1000,20,"#000000",null)

    bluePlatforms = Array(7).fill()
    bluePlatforms = bluePlatforms.map((_,i)=>new Platform(i*90,Math.floor(Math.random()*31+22),75,10,null,platformImage))

    // combine all platforms
    platforms = [...bluePlatforms,platform]

    genericObjects = [new GenericObject(0,0,backgroundImage)]
}


// keeps on running
const animate = () =>{
    
    c.clearRect(0,0,canvas.width,canvas.height)
    window.requestAnimationFrame(animate)
    
    genericObjects.map(genericObject=>{
        genericObject.render()
        genericObject.update()
        })
    platform.render()
    platform.update()
    bluePlatforms.map((p)=>p.render())
    bluePlatforms.map((p)=>p.update())
        
    
    player.render()
    player.update()



   // high precision collision detection
   let dy
   if(player.jump && player.jumpCount>0){
       dy = 0
   }else if(player.jump&&player.jumpCount<=0){
       dy = -player.jumpDistance 
   }else{   
     dy = player.gravity
   }    


outerloop: for(var j = 0; j<platforms.length;j++){
  
    // checks collision precisely
    for(var i = 1 ; i<=dy;i++){
        
        if(
            player.y+i+player.height>=platforms[j].y&&
            player.y + player.height<=platforms[j].y &&
            player.x+player.width>=platforms[j].x &&
            player.x<=platforms[j].x+platforms[j].width
        ){
            player.y -= i
            player.jump=false
            player.jumpCount = 10
            player.jumpDistance = 0
            break outerloop;
        }else{
           
                player.gravity = 1
            
        }
    }
 
   }

   // restart game when player falls out of the world
   if(player.y>canvas.height) init()
  


}

init()
animate()

window.addEventListener("keydown",({code})=>{
    // console.log("Pressed: "+code)
    pressed = true
    if(code==='KeyD'){
        player.dir = 'right'
        player.currentSprite=player.sprite.run
    }if(code==='KeyA'){
        player.dir='left'
        player.currentSprite=player.sprite.run
    } if(code==='KeyW'){
        // player.dir='up' 
        player.jump = true
        player.currentSprite=player.sprite.jump
    }
})

window.addEventListener("keyup",({code})=>{
    // console.log("Released:"+code)
    if(code!=="KeyW"){ 
        pressed = false
        player.currentSprite =player.sprite.idle
    }
    
})


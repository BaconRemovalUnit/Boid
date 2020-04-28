
let camera, scene, renderer,controls;
let camera_x,camera_y,camera_z;
let bounding_box;

let gui_settings = new function () {
    this.MAX_V = 2;
    this.MAX_X = 400;
    this.MAX_Y = 400;
    this.MAX_Z = 400;
    this.BoidCount = 300;
    this.AvoidanceRange = 20;
    this.NeighbourRange = 50;
    this.BorderLoop = true;
    this.ShowBorder = true;
    this.AvoidRule = true;
    this.FollowRule = true;
    this.JoinRule = true;
    this.AddSaintQuartz = false;

};

let MAX_X = gui_settings.MAX_X;
let MAX_Y = gui_settings.MAX_Y;
let MAX_Z = gui_settings.MAX_Z;
let MAX_V = gui_settings.MAX_V;
let borderless = gui_settings.BorderLoop;
let num_boids =gui_settings.BoidCount;
let neighbourRange = gui_settings.NeighbourRange; //awareness range
let avoidDistance = gui_settings.AvoidanceRange; // min distance to avoid neighbour
let avoidRule = gui_settings.AvoidRule;
let followRule = gui_settings.FollowRule;
let joinRule = gui_settings.JoinRule;
let boids = [];
let velocities = [];
let stats = new Stats();

init();
animate();

function addBoid(){

    let material = new THREE.MeshNormalMaterial();
    let boid_geo;
    // saint quartz
    if(gui_settings.AddSaintQuartz){
        let boid_up = new THREE.ConeGeometry(7,10,3);
        boid_up.rotateX(Math.PI);
        let boid_down = new THREE.ConeGeometry(7,10,3);
        let up_mesh = new THREE.Mesh(boid_up);
        let down_mesh = new THREE.Mesh(boid_down);
        down_mesh.translateY(5);
        boid_geo = new THREE.Geometry();
        up_mesh.updateMatrix();
        boid_geo.merge(up_mesh.geometry,up_mesh.matrix);
        down_mesh.updateMatrix();
        boid_geo.merge(down_mesh.geometry,down_mesh.matrix);
        boid_geo.translate(0,-4.5,0);
    }
    else{
        //normal ball
        boid_geo = new THREE.SphereGeometry(6,11,11);
    }

    let boid = new THREE.Mesh(boid_geo, material);
    boid.position.x = Math.random()*MAX_X;
    boid.position.y = Math.random()*MAX_Y;
    boid.position.z = Math.random()*MAX_Z;
    // init boid speed
    let boid_v = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1);
    boid_v.normalize().multiplyScalar(MAX_V);

    boids.push(boid);
    velocities.push(boid_v);
    scene.add(boid);
}

function removeBoid(){
    let boid = boids.pop();
    velocities.pop();
    scene.remove(boid)
}

function setBoundingBox() {
    let border_geometry= new THREE.BoxGeometry(MAX_X,MAX_Y,MAX_Z);
    let border_material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    let bounding_box_mesh = new THREE.Mesh(border_geometry, border_material);
    bounding_box_mesh.position.set(MAX_X/2, MAX_Y/2, MAX_Z/2);
    bounding_box = new THREE.BoxHelper(bounding_box_mesh, 0xffffff );
    scene.add( bounding_box);
}

function init() {
    camera_x = MAX_X*0.9;
    camera_y = MAX_Y*0.8;
    camera_z = MAX_Z*0.8;
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1,10000 );
    camera.position.set(camera_x, camera_y, camera_z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    scene = new THREE.Scene();

    setBoundingBox();

    //adding boids
    for (let i = 0; i < num_boids; i++) {
        addBoid();
    }

    renderer = new THREE.WebGLRenderer( {antialias:true , alpha: true} );
    renderer.setClearColor( 0x2f2f2f, 1);
    renderer.setSize( window.innerWidth, window.innerHeight );

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.target.set( MAX_X/2, MAX_Y/2, MAX_Z/2 );
    let gui = new dat.GUI();
    gui.add(gui_settings, 'MAX_V', 0,20);
    gui.add(gui_settings,'MAX_X',50,2000);
    gui.add(gui_settings,'MAX_Y',50,2000);
    gui.add(gui_settings,'MAX_Z',50,2000);
    gui.add(gui_settings,'BorderLoop');
    gui.add(gui_settings,'ShowBorder');
    gui.add(gui_settings,'NeighbourRange',10,400);
    gui.add(gui_settings,'AvoidanceRange',10,400);
    gui.add(gui_settings,'BoidCount',0,2000);
    gui.add(gui_settings,'AvoidRule');
    gui.add(gui_settings,'FollowRule');
    gui.add(gui_settings,'JoinRule');
    gui.add(gui_settings,'AddSaintQuartz');
    document.body.appendChild( renderer.domElement );


    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
}	


function getDistance(v1,v2) {
    let dx = v1.position.x - v2.position.x;
    let dy = v1.position.y - v2.position.y;
    let dz = v1.position.z - v2.position.z;
    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function getSpeed(v1) {
    return Math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z );
}

function animate() {
    stats.begin();
    MAX_V = gui_settings.MAX_V;
    let changed_div = false;
    if(MAX_X !== gui_settings.MAX_X ||MAX_Y !== gui_settings.MAX_Y|| MAX_Z !== gui_settings.MAX_Z   ){
        changed_div = true;
    }

    MAX_X = gui_settings.MAX_X;
    MAX_Y = gui_settings.MAX_Y;
    MAX_Z = gui_settings.MAX_Z;

    if(changed_div){
        scene.remove(bounding_box);
        controls.target.set( MAX_X/2, MAX_Y/2, MAX_Z/2 );
        setBoundingBox();
    }
    bounding_box.visible= gui_settings.ShowBorder;
    borderless = gui_settings.BorderLoop;
    neighbourRange = gui_settings.NeighbourRange;
    avoidDistance = gui_settings.AvoidanceRange;
    avoidRule = gui_settings.AvoidRule;
    followRule = gui_settings.FollowRule;
    joinRule = gui_settings.JoinRule;
    
    if(num_boids > gui_settings.BoidCount){

        for (let i = 0; i < num_boids-gui_settings.BoidCount; i++) {
            removeBoid();
        }
    }
    else if(num_boids < gui_settings.BoidCount){

        for (let i = 0; i < gui_settings.BoidCount-num_boids ; i++) {
            addBoid();
        }
    }
    num_boids = gui_settings.BoidCount;


    for (let i = 0; i < boids.length; i++) {

        //calculate new velocities
        boids[i].translateX(velocities[i].x);
        boids[i].translateY(velocities[i].y);
        boids[i].translateZ(velocities[i].z);

        //calculate rule 2 and 3
        let local_n = new THREE.Vector3();
        let local_v = new THREE.Vector3();
        let n = 0;

        let v1 = new THREE.Vector3();

        for (let j = 0; j < boids.length; j++) {
            if(i === j){
                continue
            }

            let dist = getDistance(boids[i],boids[j]);
            if(dist <= neighbourRange){
                local_n.add(boids[j].position);
                local_v.add(velocities[j]);
                n++;

            }

            //rule 1
            if(dist <= avoidDistance){
                v1.add(boids[i].position).sub(boids[j].position);
                v1.divideScalar(10);
            }
        }

        if(n>0){
            //calculate rule2 and rule3
            local_n.divideScalar(n);
            local_v.divideScalar(n);
            local_n.sub(boids[i].position);
            local_n.divideScalar(100);
            local_v.add(velocities[i]);
        }

        if(avoidRule){
            velocities[i].add(v1);
        }
        if(joinRule){
            velocities[i].add(local_n);
        }
        if(followRule){
            velocities[i].add(local_v);
        }

        // let gravity = new THREE.Vector3(0,-(1+MAX_V)/10,0);
        // velocities[i].add(gravity);

        // limit speed
        if(getSpeed(velocities[i]) > MAX_V){
            velocities[i] = velocities[i].normalize().multiplyScalar(MAX_V);
        }

        if(borderless){
            if(boids[i].position.x > MAX_X){
                boids[i].position.x = 10
            }
            if(boids[i].position.x < 0){
                boids[i].position.x = MAX_X-10
            }

            if(boids[i].position.y > MAX_Y){
                boids[i].position.y = 10
            }
            if(boids[i].position.y < 0){
                boids[i].position.y = MAX_Y- 10
            }
            if(boids[i].position.z > MAX_Z){
                boids[i].position.z = 10
            }
            if(boids[i].position.z < 0){
                boids[i].position.z = MAX_Z -10
            }
        }
        else {
            if(boids[i].position.x > MAX_X){
                velocities[i].x = -velocities[i].x;
                boids[i].position.x = MAX_X;
            }
            if(boids[i].position.x < 0){
                velocities[i].x = -velocities[i].x;
                boids[i].position.x = 0;
            }

            if(boids[i].position.y > MAX_Y){
                velocities[i].y = -velocities[i].y;
                boids[i].position.y = MAX_Y;
            }
            if(boids[i].position.y < 0){
                velocities[i].y = -velocities[i].y;
                boids[i].position.y = 0;
            }
            if(boids[i].position.z > MAX_Z){
                velocities[i].z = -velocities[i].z;
                boids[i].position.z = MAX_Z;
            }
            if(boids[i].position.z < 0){
                velocities[i].z = -velocities[i].z;
                boids[i].position.z = 0;
            }
        }
    }
    stats.end();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}


function  onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}

window.addEventListener('resize',onWindowResize,false);

// Playground scene creation
var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 45, -22), scene);
    
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Initialize Havok plugin
    const hk = new BABYLON.HavokPlugin();

    // Enable physics in the scene with a gravity
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // Load GLB exported from Blender using Physics extension enabled
    BABYLON.ImportMeshAsync("http://localhost:8080/gcs-files_02991ab549496c9eb421facfab9ecb8aa317d801.glb", scene).then(()=>{

        // Setup ground
        // static physics cubes
        var cubes = ["Cube", "Cube.001", "Cube.002", "Cube.003"];
        cubes.forEach((meshName)=>{
            var mesh = scene.getMeshByName(meshName)
            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {
                mass: 0, // Static objects
                restitution: 0.2, // Some bounce
                friction: 0.8 // Good friction
            });
        });
        var planes = ["Plane.001", "Plane.002", "Plane.003", "Plane.004", "Plane.005"];
        [planes].forEach((meshName)=>{
            var mesh = scene.getMeshByName(meshName)
            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {
                mass: 2, // Static objects
                restitution: 0.2, // Some bounce
                friction: 0.8 // Good friction
            });
        });        
                
        const ground = scene.getMeshByName("Plane");
        if (ground) {
            new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, {
                mass: 0, // Static objects
                restitution: 0.2, // Some bounce
                friction: 0.8 // Good friction
            });
            ground.isPickable = false;
            ground.freezeWorldMatrix();
        }      

        // Player/Character state
        var state = "ON_GROUND";
        var inAirSpeed = 8.0;
        var onGroundSpeed = 10.0;
        var jumpHeight = 1.5;
        var wantJump = 0;
        var inputDirection = new BABYLON.Vector3(0,0,0);
        var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
        let characterOrientation = BABYLON.Quaternion.Identity();
        let characterGravity = new BABYLON.Vector3(0, -20, 0);

        // Physics shape for the character
        let h = 0.1;
        let r = 0.1;
        let displayCapsule = new BABYLON.TransformNode("DisplayRoot", scene);
        let male3 = scene.getMeshByName("Male3");
        let characterPosition = male3.getAbsolutePosition();
        male3.setParent(displayCapsule);
        male3.position = new BABYLON.Vector3(0,0.6,0);
        //let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
        displayCapsule.material = new BABYLON.StandardMaterial("capsule", scene);
        displayCapsule.material.diffuseColor = new BABYLON.Color3(0.2,0.9,0.8);
        let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
        camera.setTarget(characterPosition);

        // State handling
        // depending on character state and support, set the new state
        var getNextState = function(supportInfo) {
            if (state == "IN_AIR") {
                if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                    return "ON_GROUND";
                }
                return "IN_AIR";
            } else if (state == "ON_GROUND") {
                if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                    return "IN_AIR";
                }

                if (wantJump > 0) {
                    wantJump--;
                    return "START_JUMP";
                }
                return "ON_GROUND";
            } else if (state == "START_JUMP") {
                return "IN_AIR";
            }
        }

        // From aiming direction and state, compute a desired velocity
        // That velocity depends on current state (in air, on ground, jumping, ...) and surface properties
        var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation, currentVelocity) {
            let nextState = getNextState(supportInfo);
            if (nextState != state) {
                state = nextState;
            }

            let upWorld = characterGravity.normalizeToNew();
            upWorld.scaleInPlace(-1.0);
            let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation);
            if (state == "IN_AIR") {
                let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation);
                let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
                // Restore to original vertical component
                outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
                outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
                // Add gravity
                outputVelocity.addInPlace(characterGravity.scale(deltaTime));
                return outputVelocity;
            } else if (state == "ON_GROUND") {
                // Move character relative to the surface we're standing on
                // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
                // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
                let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation);

                let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
                // Horizontal projection
                {
                    outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
                    let inv1k = 1e-3;
                    if (outputVelocity.dot(upWorld) > inv1k) {
                        let velLen = outputVelocity.length();
                        outputVelocity.normalizeFromLength(velLen);

                        // Get the desired length in the horizontal direction
                        let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

                        // Re project the velocity onto the horizontal plane
                        let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                        outputVelocity = c.cross(upWorld);
                        outputVelocity.scaleInPlace(horizLen);
                    }
                    outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
                    return outputVelocity;
                }
            } else if (state == "START_JUMP") {
                let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
                let curRelVel = currentVelocity.dot(upWorld);
                return currentVelocity.add(upWorld.scale(u - curRelVel));
            }
            return Vector3.Zero();
        }

        // Display tick update: compute new camera position/target, update the capsule for the character display
        scene.onBeforeRenderObservable.add((scene) => {
            displayCapsule.position.copyFrom(characterController.getPosition());

            // Fixed camera behind character
            const characterPos = displayCapsule.position;
            
            // Define camera offset behind the character (distance and height)
            const cameraDistance = 5.0;  // Distance behind character
            const cameraHeight = 3.0;    // Height above character
            
            // Get character's forward direction from orientation
            const forwardDirection = forwardLocalSpace.applyRotationQuaternion(characterOrientation);
            
            // Calculate camera position behind the character
            const behindDirection = forwardDirection.scale(-1); // Opposite of forward
            const cameraOffset = behindDirection.scale(cameraDistance);
            cameraOffset.y += cameraHeight;
            
            // Set camera position and target
            camera.position.copyFrom(characterPos.add(cameraOffset));
            camera.setTarget(characterPos.add(new BABYLON.Vector3(0, 1, 0))); // Target slightly above character
        });

        // After physics update, compute and set new velocity, update the character controller state
        scene.onAfterPhysicsObservable.add((_) => {
            if (scene.deltaTime == undefined) return;
            let dt = scene.deltaTime / 1000.0;
            if (dt == 0) return;

            let down = new BABYLON.Vector3(0, -1, 0);
            let support = characterController.checkSupport(dt, down);

            BABYLON.Quaternion.FromEulerAnglesToRef(0,camera.rotation.y, 0, characterOrientation);
            let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
            characterController.setVelocity(desiredLinearVelocity);

            characterController.integrate(dt, support, characterGravity);
        });

        let isKeyDown = false;

        // Rotate camera
        // Add a slide vector to rotate arount the character
        let isMouseDown = false;
        let mouseDownY = 0;
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    isMouseDown = true;
                    mouseDownY = pointerInfo.event.y;
                    break;

                case BABYLON.PointerEventTypes.POINTERUP:
                    isMouseDown = false;
                    if (!isKeyDown) {
                        inputDirection.z = 0;
                    }
                    break;

                case BABYLON.PointerEventTypes.POINTERMOVE:
                    if (isMouseDown) {
                        var tgt = camera.getTarget().clone();
                        camera.position.addInPlace(camera.getDirection(BABYLON.Vector3.Right()).scale(pointerInfo.event.movementX * -0.02));
                        camera.setTarget(tgt);

                        if (!isKeyDown)
                        {
                            const deltaY = mouseDownY - pointerInfo.event.y;
                            if (Math.abs(deltaY) > 100) {
                                inputDirection.z = Math.sign(deltaY);
                            }
                        }
                    }
                    break;

                case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                    ++wantJump;
                    break;
            }
        });
        // Input to direction
        // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    isKeyDown = true;
                    if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                        inputDirection.z = 1;
                    } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                        inputDirection.z = -1;
                    } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                        inputDirection.x = -1;
                    } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                        inputDirection.x = 1;
                    } else if (kbInfo.event.key == ' ') {
                        ++wantJump;
                    }
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    isKeyDown = false;
                    if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                        inputDirection.z = 0;    
                    }
                    if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                        inputDirection.x = 0;
                    } else if (kbInfo.event.key == ' ') {
                        wantJump = 0;
                    }
                    break;
            }
        });
    });
    
    return scene;
};
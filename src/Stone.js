import * as THREE from 'three';

class Stone {
  DIMENSIONS = {
    radius: 12,
    thickness: 9.8,
  };

  constructor({material, color}) {
    this.material = material;
    this.color = color;
  }

  makeStone() {
    const r = this.DIMENSIONS.radius;
    const h = this.DIMENSIONS.thickness / 2;
    const R = (r * r + h * h) / (2 * h);

    const phi = Math.atan(r / (R - h));

    const halfGeometry = new THREE.SphereGeometry(R, 32, 32, 0, Math.PI * 2, 0, phi);

    const topHalf = new THREE.Mesh(halfGeometry);
    topHalf.rotation.x = THREE.Math.degToRad(90);
    topHalf.position.z = -(R - h);
    topHalf.updateMatrix();

    const bottomHalf = new THREE.Mesh(halfGeometry);
    bottomHalf.rotation.x = THREE.Math.degToRad(-90);
    bottomHalf.position.z = (R - h);
    bottomHalf.updateMatrix();

    const combined = new THREE.Geometry();
    combined.merge(topHalf.geometry, topHalf.matrix);
    combined.merge(bottomHalf.geometry, bottomHalf.matrix);

    const material = this.material || new THREE.MeshBasicMaterial({
      color: this.color,
    });

    const stone = new THREE.Mesh(combined, material);
    stone.position.z = h;

    stone.castShadow = true;
    stone.receiveShadow = true;

    return stone;
  }

  getSceneObject() {
    return this.makeStone();
  }

  update() {
    // do nothing
  }
}

export {Stone};

import React from "react";
import BallroomScene from "@/components/speakeasy/ballroom/BallroomScene";

// The Crystal Ballroom — beyond the matte black door in the East Wing.
export default function SpeakeasyBallroomEast() {
  return (
    <BallroomScene
      image="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/dcd36e846_Copilot_20260702_004450.png"
      kicker="Beyond the Door"
      title="The Crystal Ballroom"
      accent="#7FB3D5"
      backTo="/speakeasy/hallway-east"
      backLabel="Back to the East Wing"
    />
  );
}
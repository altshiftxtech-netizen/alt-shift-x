import React from "react";
import BallroomScene from "@/components/speakeasy/ballroom/BallroomScene";

// The Grand Ballroom — beyond the matte black door in the main Hallway.
export default function SpeakeasyBallroom() {
  return (
    <BallroomScene
      image="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/1d3c298da_Copilot_20260702_004140.png"
      kicker="Beyond the Door"
      title="The Grand Ballroom"
      accent="#C8A95B"
      backTo="/speakeasy/hallway"
      backLabel="Back to the Hallway"
      showVault
    />
  );
}
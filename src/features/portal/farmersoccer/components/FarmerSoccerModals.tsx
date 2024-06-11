import React, { useEffect, useState } from "react";

import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { FARMER_SOCCER_NPCS } from "../lib/types";
import PubSub from "pubsub-js";

export const FarmerSoccerModals: React.FC = () => {
  const [showJoinRedModal, setshowJoinRedModal] = useState(false);
  const [showLeaveRedModal, setshowLeaveRedModal] = useState(false);
  const [showAnotherTeamRedModal, setshowAnotherTeamRedModal] = useState(false);
  const [showJoinBlueModal, setshowJoinBlueModal] = useState(false);
  const [showLeaveBlueModal, setshowLeaveBlueModal] = useState(false);
  const [showAnotherTeamBlueModal, setshowAnotherTeamBlueModal] =
    useState(false);

  useEffect(() => {
    PubSub.subscribe("showJoinRedModal", () => {
      setshowJoinRedModal(true);
    });
    PubSub.subscribe("showLeaveRedModal", () => {
      setshowLeaveRedModal(true);
    });
    PubSub.subscribe("showAnotherTeamRedModal", () => {
      setshowAnotherTeamRedModal(true);
    });
    PubSub.subscribe("showJoinBlueModal", () => {
      setshowJoinBlueModal(true);
    });
    PubSub.subscribe("showLeaveBlueModal", () => {
      setshowLeaveBlueModal(true);
    });
    PubSub.subscribe("showAnotherTeamBlueModal", () => {
      setshowAnotherTeamBlueModal(true);
    });
  });
  return (
    <div>
      <Modal show={showJoinRedModal}>
        <Panel bumpkinParts={FARMER_SOCCER_NPCS.RedTeamNPC}>
          <div className="p-2">
            <p className="mb-2">{`Hey, do you wanna join the Red Team?`}</p>
            <p className="text-sm mb-1">{`You will join the queue to play for our team.`}</p>
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowJoinRedModal(false);
                JoinRedTeam();
              }}
            >
              {`Sure, join the queue`}
            </Button>
            &nbsp;
            <Button onClick={() => setshowJoinRedModal(false)}>
              {`Not now`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showLeaveRedModal}>
        <Panel bumpkinParts={FARMER_SOCCER_NPCS.RedTeamNPC}>
          <div className="p-2">
            <p className="mb-2">{`Hey, you are already on the Team!`}</p>
            <p className="text-sm mb-1">{`Wait your turn to play.`}</p>
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowLeaveRedModal(false);
                LeaveRedTeam();
              }}
            >
              {`Leave the queue`}
            </Button>
            &nbsp;
            <Button onClick={() => setshowLeaveRedModal(false)}>
              {`Close`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showAnotherTeamRedModal}>
        <Panel bumpkinParts={FARMER_SOCCER_NPCS.RedTeamNPC}>
          <div className="p-2">
            <p className="mb-2">
              {`You already joined the other team, get outta here!`}
            </p>
          </div>
          <div className="flex">
            <Button onClick={() => setshowAnotherTeamRedModal(false)}>
              {`Close`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showJoinBlueModal}>
        <Panel bumpkinParts={FARMER_SOCCER_NPCS.BlueTeamNPC}>
          <div className="p-2">
            <p className="mb-2">{`Hey, do you wanna join the Blue Team?`}</p>
            <p className="text-sm mb-1">{`You will join the queue to play for our team.`}</p>
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowJoinBlueModal(false);
                JoinBlueTeam();
              }}
            >
              {`Sure, join the queue`}
            </Button>
            &nbsp;
            <Button onClick={() => setshowJoinBlueModal(false)}>
              {`Not now`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showLeaveBlueModal}>
        <Panel bumpkinParts={FARMER_SOCCER_NPCS.BlueTeamNPC}>
          <div className="p-2">
            <p className="mb-2">{`Hey, you are already on the Team!`}</p>
            <p className="text-sm mb-1">{`Wait your turn to play.`}</p>
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowLeaveBlueModal(false);
                LeaveBlueTeam();
              }}
            >
              {`Leave the queue`}
            </Button>
            &nbsp;
            <Button onClick={() => setshowLeaveBlueModal(false)}>
              {`Close`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showAnotherTeamBlueModal}>
        <Panel bumpkinParts={FARMER_SOCCER_NPCS.BlueTeamNPC}>
          <div className="p-2">
            <p className="mb-2">
              {`You already joined the other team, get outta here!`}
            </p>
          </div>
          <div className="flex">
            <Button onClick={() => setshowAnotherTeamBlueModal(false)}>
              {`Close`}
            </Button>
          </div>
        </Panel>
      </Modal>
    </div>
  );
};

export async function JoinRedTeam() {
  //console.log('joinRedTeam');
  PubSub.publish("joinRedTeam");
}
export async function LeaveRedTeam() {
  //console.log('leaveRedTeam');
  PubSub.publish("leaveRedTeam");
}
export async function JoinBlueTeam() {
  //console.log('joinBlueTeam');
  PubSub.publish("joinBlueTeam");
}
export async function LeaveBlueTeam() {
  //console.log('leaveBlueTeam');
  PubSub.publish("leaveBlueTeam");
}

import React, { useEffect, useState } from "react";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { FARMER_FOOTBALL_NPCS } from "../lib/types";
import PubSub from "pubsub-js";
import { CountdownLabel } from "components/ui/CountdownLabel";
import { FarmerFootballDonations } from "./FarmerFootballDonations";

export const FarmerFootballModals: React.FC = () => {
  const [showJoinRedModal, setshowJoinRedModal] = useState(false);
  const [showLeaveRedModal, setshowLeaveRedModal] = useState(false);
  const [showReadyRedModal, setshowReadyRedModal] = useState(false);
  const [showJoinBlueModal, setshowJoinBlueModal] = useState(false);
  const [showLeaveBlueModal, setshowLeaveBlueModal] = useState(false);
  const [showReadyBlueModal, setshowReadyBlueModal] = useState(false);

  const [showDonationModal, setshowDonationModal] = useState(false);
  const [showWinnerModal, setshowWinnerModal] = useState(false);
  const [showLoserModal, setshowLoserModal] = useState(false);
  const [showAbandonModal, setshowAbandonModal] = useState(false);
  const [showAnotherTeamModal, setshowAnotherTeamModal] = useState(false);
  const [NPC, setNPC] = useState(FARMER_FOOTBALL_NPCS.RedTeamNPC);

  const [time, setTime] = useState(30);
  const [time5, setTime5] = useState(5);
  const [leave, setLeave] = useState(false);
  let confirmTime = Date.now();

  let interval: NodeJS.Timer;

  useEffect(() => {
    PubSub.subscribe("showDonationModal", () => {
      setshowDonationModal(true);
    });
    PubSub.subscribe("showJoinRedModal", () => {
      setshowJoinRedModal(true);
    });
    PubSub.subscribe("showLeaveRedModal", () => {
      setshowLeaveRedModal(true);
    });
    PubSub.subscribe("showAnotherTeamRedModal", () => {
      setNPC(FARMER_FOOTBALL_NPCS.RedTeamNPC);
      setshowAnotherTeamModal(true);
    });
    PubSub.subscribe("showReadyRedModal", () => {
      confirmTime = Date.now();
      if (!showReadyRedModal) {
        setshowLeaveRedModal(false);
        setshowReadyRedModal(true);
        setLeave(true);
        interval = setInterval(() => {
          const timeLeft = 30 - (Date.now() - confirmTime) / 1000;
          setTime(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(interval);
            setshowReadyRedModal(false);
            if (leave) LeaveRedTeam();
          }
        }, 1000);
      }
    });
    PubSub.subscribe("showRedAbandonModal", () => {
      confirmTime = Date.now();
      if (!showAbandonModal) {
        setshowReadyBlueModal(false);
        setNPC(FARMER_FOOTBALL_NPCS.BlueTeamNPC);
        setshowAbandonModal(true);
        interval = setInterval(() => {
          const timeLeft = 5 - (Date.now() - confirmTime) / 1000;
          setTime5(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(interval);
            setshowAbandonModal(false);
          }
        }, 1000);
      }
    });
    PubSub.subscribe("showJoinBlueModal", () => {
      setshowJoinBlueModal(true);
    });
    PubSub.subscribe("showLeaveBlueModal", () => {
      setshowLeaveBlueModal(true);
    });
    PubSub.subscribe("showAnotherTeamBlueModal", () => {
      setNPC(FARMER_FOOTBALL_NPCS.BlueTeamNPC);
      setshowAnotherTeamModal(true);
    });
    PubSub.subscribe("showReadyBlueModal", () => {
      confirmTime = Date.now();
      if (!showReadyBlueModal) {
        setshowLeaveBlueModal(false);
        setshowReadyBlueModal(true);
        setLeave(true);
        interval = setInterval(() => {
          const timeLeft = 30 - (Date.now() - confirmTime) / 1000;
          setTime(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(interval);
            setshowReadyBlueModal(false);
            if (leave) LeaveBlueTeam();
          }
        }, 1000);
      }
    });
    PubSub.subscribe("showBlueAbandonModal", () => {
      confirmTime = Date.now();
      if (!showAbandonModal) {
        setshowReadyRedModal(false);
        setNPC(FARMER_FOOTBALL_NPCS.RedTeamNPC);
        setshowAbandonModal(true);
        interval = setInterval(() => {
          const timeLeft = 5 - (Date.now() - confirmTime) / 1000;
          setTime5(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(interval);
            setshowAbandonModal(false);
          }
        }, 1000);
      }
    });
    PubSub.subscribe("showWinnerModalRed", () => {
      setNPC(FARMER_FOOTBALL_NPCS.RedTeamNPC);
      setshowWinnerModal(true);
    });
    PubSub.subscribe("showWinnerModalBlue", () => {
      setNPC(FARMER_FOOTBALL_NPCS.BlueTeamNPC);
      setshowWinnerModal(true);
    });
    PubSub.subscribe("showLoserModalRed", () => {
      setNPC(FARMER_FOOTBALL_NPCS.RedTeamNPC);
      setshowLoserModal(true);
    });
    PubSub.subscribe("showLoserModalBlue", () => {
      setNPC(FARMER_FOOTBALL_NPCS.BlueTeamNPC);
      setshowLoserModal(true);
    });
  });

  return (
    <div>
      <Modal show={showJoinRedModal}>
        <Panel bumpkinParts={FARMER_FOOTBALL_NPCS.RedTeamNPC}>
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
        <Panel bumpkinParts={FARMER_FOOTBALL_NPCS.RedTeamNPC}>
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
      <Modal show={showReadyRedModal}>
        <Panel bumpkinParts={FARMER_FOOTBALL_NPCS.RedTeamNPC}>
          <div className="p-2">
            <p className="mb-2">{`Are you ready? The rules are simple, the first to score 2 goals wins.`}</p>
            {/* { <p className="text-sm mb-1">{time}</p> } */}
            <CountdownLabel timeLeft={time} />
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowReadyRedModal(false);
                setLeave(false);
                ReadyRedTeam();
              }}
            >
              {`Ready`}
            </Button>
            &nbsp;
            <Button
              onClick={() => {
                setshowReadyRedModal(false);
                setLeave(false);
                LeaveRedTeam();
              }}
            >
              {`No, leave the queue`}
            </Button>
          </div>
        </Panel>
      </Modal>

      <Modal show={showJoinBlueModal}>
        <Panel bumpkinParts={FARMER_FOOTBALL_NPCS.BlueTeamNPC}>
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
        <Panel bumpkinParts={FARMER_FOOTBALL_NPCS.BlueTeamNPC}>
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
      <Modal show={showReadyBlueModal}>
        <Panel bumpkinParts={FARMER_FOOTBALL_NPCS.BlueTeamNPC}>
          <div className="p-2">
            <p className="mb-2">{`Are you ready? The rules are simple, the first to score 2 goals wins.`}</p>
            {/* <p className="text-sm mb-1">{`You will join the queue to play for our team.`}</p> */}
            <CountdownLabel timeLeft={time} />
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowReadyBlueModal(false);
                setLeave(false);
                ReadyBlueTeam();
              }}
            >
              {`Ready`}
            </Button>
            &nbsp;
            <Button
              onClick={() => {
                setshowReadyBlueModal(false);
                setLeave(false);
                LeaveBlueTeam();
              }}
            >
              {`No, leave the queue`}
            </Button>
          </div>
        </Panel>
      </Modal>

      <Modal show={showAbandonModal}>
        <Panel bumpkinParts={NPC}>
          <div className="p-2">
            <p className="mb-2">{`Your opponent fled, you will return to first in the waiting queue.`}</p>
            <CountdownLabel timeLeft={time5} />
          </div>
          <div className="flex">
            <Button
              onClick={() => {
                setshowAbandonModal(false);
              }}
            >
              {`OK`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showAnotherTeamModal}>
        <Panel bumpkinParts={NPC}>
          <div className="p-2">
            <p className="mb-2">
              {`You already joined the other team, get outta here!`}
            </p>
          </div>
          <div className="flex">
            <Button onClick={() => setshowAnotherTeamModal(false)}>
              {`Close`}
            </Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showWinnerModal}>
        <Panel bumpkinParts={NPC}>
          <div className="p-2">
            <p className="mb-2">
              {`Congratulations, you won! Enter the queue to play again.`}
            </p>
          </div>
          <div className="flex">
            <Button onClick={() => setshowWinnerModal(false)}>{`Close`}</Button>
          </div>
        </Panel>
      </Modal>
      <Modal show={showLoserModal}>
        <Panel bumpkinParts={NPC}>
          <div className="p-2">
            <p className="mb-2">
              {`You lost! Enter the queue to keep practicing.`}
            </p>
          </div>
          <div className="flex">
            <Button onClick={() => setshowLoserModal(false)}>{`Close`}</Button>
          </div>
        </Panel>
      </Modal>
      <Modal
        show={showDonationModal}
        onHide={() => setshowDonationModal(false)}
      >
        <CloseButtonPanel
          title="Enjoying this game?"
          bumpkinParts={FARMER_FOOTBALL_NPCS.DonationNPC}
          onClose={() => setshowDonationModal(false)}
        >
          <div className="p-2">
            <p className="mb-2">{`Please consider donating to keep the servers running.`}</p>
          </div>
          <FarmerFootballDonations />
          {/* <div className="flex">
            <Button onClick={() => setshowDonationModal(false)}>
              {`Not now`}
            </Button>
          </div> */}
        </CloseButtonPanel>
      </Modal>
    </div>
  );
};

export async function JoinRedTeam() {
  PubSub.publish("joinRedTeam");
}
export async function LeaveRedTeam() {
  PubSub.publish("leaveRedTeam");
}
export async function ReadyRedTeam() {
  PubSub.publish("readyRedTeam");
}
export async function JoinBlueTeam() {
  PubSub.publish("joinBlueTeam");
}
export async function LeaveBlueTeam() {
  PubSub.publish("leaveBlueTeam");
}
export async function ReadyBlueTeam() {
  PubSub.publish("readyBlueTeam");
}

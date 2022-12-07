import React, { useState } from "react";
import "./BoopBox.css";
import { Avatar, Button } from "@mui/material";

function BoopBox() {
  const [boopMessage, setBoopMessage] = useState("");

  return (
    <div className="boopBox">
      <form>
        <div className="boopBox__input">
          <Avatar src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a6b9cb17-f537-4ec9-9cac-3dcba55f5584/ddwpicj-5fee631f-5b2a-4534-91ce-33bc29a137d8.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2E2YjljYjE3LWY1MzctNGVjOS05Y2FjLTNkY2JhNTVmNTU4NFwvZGR3cGljai01ZmVlNjMxZi01YjJhLTQ1MzQtOTFjZS0zM2JjMjlhMTM3ZDguanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.Bwm1Sfb48SwMdlvPVFh9F0ond3Naaf5z3rB03Ql4RDU" />
          <input
            onChange={(e) => setBoopMessage(e.target.value)}
            value={boopMessage}
            placeholder="What's boppin'?"
            type="text"
          />
        </div>

        <Button
          //onClick={sendBoop}
          type="submit"
          className="boopBox__boopButton"
        >
          Boop
        </Button>
      </form>
    </div>
  );
}

export default BoopBox
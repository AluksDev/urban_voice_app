import React from "react";
import "./MessagesBoard.css";

const MessagesBoard = () => {
  return (
    <section className="messages-board-container">
      <h3>Board</h3>
      <article>
        <div className="message-details-container">
          <span>Admin</span>
          <span>//</span>
          <span>Date Here</span>
        </div>
        <p>Message Here</p>
      </article>
      <article>
        <div className="message-details-container">
          <span>Admin</span>
          <span>//</span>
          <span>Date Here</span>
        </div>
        <p>Message Here</p>
      </article>
      <article>
        <div className="message-details-container">
          <span>Admin</span>
          <span>//</span>
          <span>Date Here</span>
        </div>
        <p>Message Here</p>
      </article>
    </section>
  );
};

export default MessagesBoard;

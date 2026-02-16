import "./Skeleton_MessagesBoard.css";

const Skeleton_MessagesBoard = () => {
  // Create an array of 5 items to represent the loading state
  const skeletonItems = Array.from({ length: 5 });

  return (
    <section className="messages-board-container skeleton-board">
      <div className="skeleton-header"></div>
      <div className="messages-scroll-container">
        {skeletonItems.map((_, index) => (
          <article key={index} className="skeleton-article">
            <div className="message-details-container">
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-date"></div>
            </div>
            <div className="skeleton-text skeleton-content-line"></div>
            <div className="skeleton-text skeleton-content-line short"></div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Skeleton_MessagesBoard;

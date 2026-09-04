import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonLoading() {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="card p-3 mb-3 shadow-sm">
          <h5><Skeleton width="15%" /></h5>
          <p><Skeleton width="20%" /></p>
          <p><Skeleton width="17%" /></p>
          <button className="btn"><Skeleton width="100%" /></button>
        </div>
      ))}
    </>
  );
}

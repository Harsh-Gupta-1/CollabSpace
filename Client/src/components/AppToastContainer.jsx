import { Slide, ToastContainer } from "react-toastify";

/**
 * Single app-wide toast host — Tactical Blueprint styling via src/styles/toastify-ds.css
 */
export default function AppToastContainer() {
  return (
    <ToastContainer
      className="toastify-ds-root font-body"
      toastClassName="ds-toast font-body"
      position="bottom-right"
      transition={Slide}
      autoClose={3200}
      limit={4}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable={false}
      theme="dark"
      icon={false}
      bodyClassName="ds-toast-body font-body"
    />
  );
}

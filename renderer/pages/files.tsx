import { useEffect } from "react";

export default function Files() {
  function getFiles() {
    fetch("http://localhost:3001/files")
      .then((response) => response.json())
      .then((data) => console.log(data));
  }

  useEffect(() => {
    getFiles();
  }, []);

  return (
    <div className="flex flex-col shrink h-full relative">
      <h1>Files</h1>
    </div>
  );
}

export function formatSeconds(seconds?: number) {
  if (!seconds) {
    return "";
  }
  const hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  seconds = Math.floor(seconds);
  let result = (
    (minutes < 10 ? "0" : "") +
    minutes +
    ":" +
    (seconds < 10 ? "0" : "") +
    seconds
  );

  if (hours > 0) {
    result = hours + ":" + result;
  }
  return result;
}

import { v4 as uuidv4 } from "uuid";

export default function generateMeetingId() {
  return uuidv4();
}
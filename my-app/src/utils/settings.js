import { 
    FACEMESH_RIGHT_EYE,
    FACEMESH_RIGHT_EYEBROW,
    FACEMESH_RIGHT_IRIS,
    FACEMESH_LEFT_EYE,
    FACEMESH_LEFT_EYEBROW,
    FACEMESH_LEFT_IRIS,
    FACEMESH_FACE_OVAL,
    FACEMESH_LIPS,
    FACEMESH_TESSELATION } from "@mediapipe/face_mesh";

export const settings = [
    {
      name: "1",
      style: {color: "#E0E0E0", lineWidth: 1},
      attribute: FACEMESH_TESSELATION,
        type: "connector"},
    {
        name: "2",
        style: {color: "#FF3030"},
        attribute: FACEMESH_RIGHT_EYE,
        type: "connector"},
    {
        name: "3",
        style: {color: "#FF3030"},
        attribute: FACEMESH_RIGHT_EYEBROW,
        type: "connector"},
    {
        name: "4",
        style: {color: "#FF3030"},
        attribute: FACEMESH_RIGHT_IRIS,
        type: "connector"},
    {
        name: "5",
        style: {color: "#30FF30"},
        attribute: FACEMESH_LEFT_EYE,
        type: "connector"},
    {
        name: "6",
        style: {color: "#30FF30"},
        attribute: FACEMESH_LEFT_EYEBROW,
        type: "connector"},
    {
        name: "7",
        style: {color: "#30FF30"},
        attribute: FACEMESH_LEFT_IRIS,
        type: "connector"},
    {
        name: "8",
        style: {color: "#E0E0E0"},
        attribute: FACEMESH_FACE_OVAL,
        type: "connector"},
    {
        name: "9",
        style: {color: "#E0E0E0"},
        attribute: FACEMESH_LIPS,
        type: "connector"},
    {
        name: "10",
        style: {color: "#BE36D4", lineWidth: 1, radius: 1},
        attribute: false,
        type: "landmark",
    },
  ];
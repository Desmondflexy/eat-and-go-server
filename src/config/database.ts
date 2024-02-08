import { connect, connection } from "mongoose";

export default function connectDB() {
  const devMode = process.env.NODE_ENV === "development";

  const databaseUrl = devMode
    ? "mongodb://localhost:27017/eat-and-go"
    : (process.env.DATABASE_URL as string);

  connect(databaseUrl)
    .then(() => console.log("Connected to local database successfully!"))
    .catch((err) => console.error("Error connecting to Database: ", err.code));

  // Event listeners for disconnection
  connection.on("disconnected", () => {
    console.log("Disconnected from the database");
  });
}

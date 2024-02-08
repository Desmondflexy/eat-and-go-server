import { connect, connection } from "mongoose";

export default function connectDB() {
  const isProduction = process.env.NODE_ENV === "production";

  const databaseUrl = isProduction
    ? (process.env.DATABASE_URL as string)
    : "mongodb://localhost:27017/eat-and-go";

  connect(databaseUrl)
    .then(() =>
      console.log(
        `🕋 Connected to ${isProduction ? "the shared" : "your local"} database successfully 🕋`,
      ),
    )
    .catch((err) => console.error("Error connecting to Database: ", err.code));

  // Event listeners for disconnection
  connection.on("disconnected", () => {
    console.log("Disconnected from the database");
  });
}

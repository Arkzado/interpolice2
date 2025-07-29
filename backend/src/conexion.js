import mysql from "mysql2/promise";

const getConnection = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "interpolice",
  });
  return connection;
};

export default getConnection;
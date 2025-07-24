import { DatabaseError } from "../components/database-error";

export default function DatabaseErrorTestPage() {
  return (
    <DatabaseError
      message="This is a dummy database error for testing."
      title="Database Connection Error"
    />
  );
}

import { useParams } from "react-router-dom";

const UserProfilePage = () => {
  const { userId } = useParams();
  return <div>UserProfilePag {userId}</div>;
};

export default UserProfilePage;

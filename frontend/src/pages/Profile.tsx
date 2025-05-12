import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PublicUser, Skill, Review } from "../store/types";
import { fetchPublicUser } from "../services/user";
import NotFoundPage from "../notFound/NotFoundPage";
import Tabs, { TabItem } from "../components/ui/Tabs";
import UserSkillCard from "../components/users/UserSkillCard";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Star } from "lucide-react";
import { format } from "date-fns";
import useBookingFlow from "../hooks/useBookingFlow";
import BookingModal from "../components/skills/BookingFlowModal";

import { fetchBookingReviews } from "../services/booking";

const UserProfile = () => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);

  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const { userId: userIdParam } = useParams<{ userId: string }>();

  const userId = userIdParam ? parseInt(userIdParam, 10) : null;

  const {
    showAvailabilityModal,
    viewingUserId,
    viewingUserAvailability,
    selectedAvailabilitySlot,
    bookingDuration,
    initialMessage,
    isBookingLoading,
    nextSessionDateTime,
    minimumBookingDuration,
    weekdays,
    handleRequestSession,
    handleSelectAvailability,
    handleBookingDurationChange,
    handleInitialMessageChange,
    handleCreateBooking,
    handleCloseModal,
  } = useBookingFlow();

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-current text-yellow-500 dark:text-yellow-400"
              : "text-muted-foreground/50 dark:text-muted-foreground-dark/50"
          }`}
        />
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  const profileContent = useMemo(
    () => (
      <div className="space-y-4 pt-5">
        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
            Full Name
          </label>
          <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
            {user?.first_name} {user?.last_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
            Username
          </label>
          <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
            {user?.username}
          </p>
        </div>
        {user?.bio && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
              Bio
            </label>
            <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
              {user.bio}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
            Email
          </label>
          <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
            {user?.email}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
            Date Joined
          </label>
          <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
            {user?.date_joined
              ? new Date(user.date_joined).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
            Availability
          </label>
          <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
            {user?.availability || "N/A"}
          </p>
        </div>
      </div>
    ),
    [user]
  );

  const skillsContent = useMemo(
    () => (
      <div className="pt-5">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark mb-4">
            Skills Offered
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillsOffered.map((skill) => (
              <UserSkillCard
                key={`offered-${skill.id}`}
                skill={skill}
                onRequestSession={() => handleRequestSession(skill)}
              />
            ))}
            {skillsOffered.length === 0 && (
              <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm">
                No skills offered yet
              </p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark mb-4">
            Skills Wanted
          </h3>

          <div className="flex flex-wrap gap-2">
            {skillsWanted.map((skill) => (
              <UserSkillCard
                key={skill.id}
                skill={skill}
                onRequestSession={() => handleRequestSession(skill)}
              />
            ))}
            {skillsWanted.length === 0 && (
              <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm">
                No skills wanted yet
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    [skillsOffered, skillsWanted, handleRequestSession]
  );

  const reviewsContent = useMemo(
    () => (
      <div className="pt-5">
        <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark mb-4">
          Reviews
        </h3>
        {isLoadingReviews ? (
          <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm">
            Loading reviews...
          </p>
        ) : reviewsError ? (
          <p className="text-destructive dark:text-destructive-dark text-sm">
            Error loading reviews: {reviewsError}
          </p>
        ) : userReviews.length === 0 ? (
          <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm">
            No reviews yet.
          </p>
        ) : (
          <div className="space-y-4">
            {userReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground dark:text-foreground-dark">
                        {review.reviewer?.first_name ||
                          review.reviewer?.username ||
                          "Anonymous"}
                      </span>

                      {renderStars(review.rating)}
                    </div>

                    {review.created_at && (
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                        {format(new Date(review.created_at), "P")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground dark:text-foreground-dark">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    ),
    [userReviews, isLoadingReviews, reviewsError]
  );

  const tabItems: TabItem[] = useMemo(
    () => [
      { value: "profile", label: "Profile", content: profileContent },
      { value: "skills", label: "Skills", content: skillsContent },
      { value: "reviews", label: "Reviews", content: reviewsContent },
    ],
    [profileContent, skillsContent, reviewsContent]
  );

  useEffect(() => {
    const getUserData = async () => {
      if (userId === null || isNaN(userId)) {
        setIsLoading(false);
        setError("Invalid user ID.");
        setIsLoadingReviews(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const userData = await fetchPublicUser(userId);
        setUser(userData);

        if (userData && Array.isArray(userData.skills)) {
          setSkillsOffered(userData.skills.filter((skill) => skill.is_offered));
          setSkillsWanted(userData.skills.filter((skill) => !skill.is_offered));
        } else {
          setSkillsOffered([]);
          setSkillsWanted([]);
        }
      } catch (err: any) {
        console.error(`Error fetching user profile ${userId}:`, err);
        const errorMessage =
          err?.response?.data?.detail ||
          err.message ||
          "Failed to load user profile.";
        setError(errorMessage);
        setUser(null);
        setSkillsOffered([]);
        setSkillsWanted([]);
      } finally {
        setIsLoading(false);
      }

      setIsLoadingReviews(true);
      setReviewsError(null);
      try {
        const reviewsData = await fetchBookingReviews({
          reviewed_user_id: userId,
        });
        setUserReviews(reviewsData);
      } catch (err: any) {
        console.error(`Error fetching reviews for user ${userId}:`, err);
        const errorMessage =
          err?.response?.data?.detail ||
          err.message ||
          "Failed to load reviews.";
        setReviewsError(errorMessage);
        setUserReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    if (userId !== null && !isNaN(userId)) {
      getUserData();
    } else {
      setIsLoading(false);
      setError("Invalid user ID provided.");
      setIsLoadingReviews(false);
    }
  }, [userId]);

  if (userId === null || isNaN(userId)) {
    return <NotFoundPage page="user" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <p className="text-foreground dark:text-foreground-dark">
          Loading user profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <p className="text-destructive dark:text-destructive-dark">
          Error: {error}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <p className="text-foreground dark:text-foreground-dark">
          User not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-card dark:bg-card-dark rounded-lg shadow-md overflow-hidden mb-6 border border-border dark:border-border-dark">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {user.profile_picture ? (
                <img
                  className="h-24 w-24 rounded-full object-cover border border-border dark:border-border-dark"
                  src={user.profile_picture}
                  alt={`${user.first_name} ${user.last_name}`}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted dark:bg-muted-dark flex items-center justify-center border border-border dark:border-border-dark">
                  <span className="text-3xl text-muted-foreground dark:text-muted-foreground-dark">
                    {user.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                    {user.first_name} {user.last_name} ({user.username})
                  </h1>
                  {user.bio && (
                    <p className="mt-2 text-muted-foreground dark:text-muted-foreground-dark">
                      {" "}
                      {user.bio}{" "}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border dark:border-border-dark">
            <Tabs
              defaultValue="profile"
              items={tabItems}
              tabsListClassName="bg-card dark:bg-card-dark p-0 rounded-none"
              tabsContentClassName="p-6 pt-0"
            />
          </div>
        </div>
      </div>

      <BookingModal
        open={showAvailabilityModal}
        onOpenChange={handleCloseModal}
        viewingUserId={viewingUserId}
        viewingUserAvailability={viewingUserAvailability}
        selectedAvailabilitySlot={selectedAvailabilitySlot}
        bookingDuration={bookingDuration}
        initialMessage={initialMessage}
        isBookingLoading={isBookingLoading}
        nextSessionDateTime={nextSessionDateTime}
        onSelectAvailability={handleSelectAvailability}
        onBookingDurationChange={handleBookingDurationChange}
        onInitialMessageChange={handleInitialMessageChange}
        onCreateBooking={handleCreateBooking}
        minimumBookingDuration={minimumBookingDuration}
        weekdays={weekdays}
      />
    </div>
  );
};

export default UserProfile;

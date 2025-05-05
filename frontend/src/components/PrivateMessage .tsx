// // ChatPage.tsx
// import React, { useState, useRef, useEffect } from "react";
// import { Send, Loader2, User as UserIcon } from "lucide-react";
// import Button from "../components/ui/Button"; // Assuming you have this Button component
// import { useAuthStore } from "../store/authStore"; // Assuming your auth store
// import { apiClient } from "../services/api"; // Assuming your API client
// import { User } from "../store/types"; // Assuming your User type
// import { useParams } from 'react-router-dom'; // Example: Using react-router-dom for getting user ID

// interface PrivateMessage {
//   id: number;
//   sender: number;
//   receiver: number;
//   message: string;
//   message_type: string;
//   created_at: string;
// }

// // We will now make this the main page component
// export default function ChatPage() {
//   // Get otherUserId from URL parameters (example using react-router-dom)
//   const { userId } = useParams<{ userId: string }>();
//   const otherUserId = userId ? parseInt(userId, 10) : null;

//   const { user, accessToken } = useAuthStore();
//   const [messages, setMessages] = useState<PrivateMessage[]>([]);
//   const [inputText, setInputText] = useState("");
//   const [isLoading, setIsLoading] = useState(true); // Set to true initially as we load data
//   const [error, setError] = useState<string | null>(null);
//   const [otherUser, setOtherUser] = useState<User | null>(null);
//   const [isSending, setIsSending] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Handle case where otherUserId is not valid
//   if (otherUserId === null || isNaN(otherUserId)) {
//       return (
//           <div className="flex items-center justify-center min-h-screen bg-gray-100 text-red-600">
//               <p>Error: Invalid user ID provided.</p>
//           </div>
//       );
//   }

//   // Generate a consistent room name based on user IDs
//   // Use optional chaining carefully if user can be null initially
//   const roomName = `private_${Math.min(user?.id || 0, otherUserId)}_${Math.max(
//     user?.id || 0,
//     otherUserId
//   )}`;

//   // Fetch chat history and other user details
//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!user?.id || !accessToken) {
//           // Handle not authenticated state if necessary
//           setIsLoading(false);
//           setError("User not authenticated."); // Or redirect to login
//           return;
//       }

//       setIsLoading(true);
//       setError(null);

//       try {
//         // Fetch other user's details
//         const userResponse = await apiClient.get(`/users/${otherUserId}/`);
//         setOtherUser(userResponse.data);

//         // Fetch chat messages
//         const response = await apiClient.get(
//           `/chatbot/private/${otherUserId}/` // Assuming this endpoint works for private chats
//         );
//         setMessages(response.data);
//       } catch (err) {
//         console.error("Error fetching chat data:", err);
//         setError("Failed to load chat.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchChatData();
//   }, [user?.id, otherUserId, accessToken]); // Depend on user, otherUserId, and token

//   // Auto-scroll to bottom when messages change or component mounts
//   useEffect(() => {
//     // Only scroll if not currently loading or if there are messages
//     if (!isLoading || messages.length > 0) {
//        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isLoading]);


//   const handleSendMessage = async () => {
//     if (inputText.trim() === "" || isSending || !user?.id || otherUserId === null) return;

//     setIsSending(true);
//     setError(null);
//     const tempId = Date.now(); // Temporary ID for optimistic update

//     try {
//       const newMessagePayload = {
//         is_group_chat: false, // Explicitly false for private chat
//         message: inputText,
//         room_name: roomName, // Include room_name if backend uses it
//         other_user_id: otherUserId, // Ensure other_user_id is sent
//       };

//       // Optimistically add the message to UI
//       const optimisticMessage: PrivateMessage = {
//           id: tempId,
//           sender: user.id,
//           receiver: otherUserId,
//           message: inputText,
//           message_type: "text", // Assuming text type
//           created_at: new Date().toISOString(), // Use current time for optimistic update
//       };
//       setMessages((prev) => [...prev, optimisticMessage]);

//       // Send to API
//       const response = await apiClient.post(
//         "/chatbot/sendMessage/", // Assuming this is the correct send endpoint
//         newMessagePayload
//       );

//       // Assuming the backend returns the actual message object upon success
//       const actualMessage = response.data;

//       // Replace optimistic message with actual response (if tempId matches)
//       setMessages((prev) =>
//         prev.map((msg) => (msg.id === tempId ? actualMessage : msg))
//       );

//       setInputText("");
//     } catch (err) {
//       console.error("Error sending message:", err);
//       setError("Failed to send message");
//       // Optionally remove optimistic message on error
//        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputText(e.target.value);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !isSending) { // Prevent sending multiple times quickly
//         e.preventDefault(); // Prevent default form submission if within a form
//         handleSendMessage();
//     }
//   };

//    // Added functionality to retry fetching history
//    const handleRetry = () => {
//         setError(null);
//         // We can simply re-run the effect or call the fetch function directly
//         // Calling the fetch function is cleaner for a manual retry
//         const fetchChatData = async () => {
//             if (!user?.id || !accessToken) {
//                 setError("User not authenticated.");
//                 return;
//             }
//             setIsLoading(true);
//             try {
//                  const userResponse = await apiClient.get(`/users/${otherUserId}/`);
//                  setOtherUser(userResponse.data);
//                  const response = await apiClient.get(`/chatbot/private/${otherUserId}/`);
//                  setMessages(response.data);
//             } catch (err) {
//                 console.error("Error fetching chat data on retry:", err);
//                 setError("Failed to reload chat.");
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchChatData();
//     };


//   const formatTime = (isoString: string) => {
//      try {
//         return new Date(isoString).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//      } catch (e) {
//          console.error("Failed to parse date string:", isoString, e);
//          return "Invalid Time"; // Handle potential invalid date strings
//      }
//   };

//   const getUserAvatar = (user: User | null) => {
//     if (!user) return <UserIcon size={20} />;

//     return user.profile_picture ? (
//       <img
//         src={user.profile_picture}
//         alt={user.first_name || user.username || "User"}
//         className="object-cover w-full h-full"
//         onError={(e) => { // Fallback to initial if image fails
//              (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image icon
//              // Could potentially set a state here to force rendering the initial fallback
//         }}
//       />
//     ) : (
//       <div className="flex items-center justify-center h-full w-full bg-blue-200 text-sm font-semibold text-blue-800">
//         {user.first_name?.charAt(0) || user.username?.charAt(0) || "U"}
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100 p-4"> {/* Full screen height page layout with padding */}
//       <div className="flex flex-col flex-grow w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"> {/* Chat box container, centered and max-width */}
//         {/* Chat header */}
//         <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10"> {/* Sticky header */}
//           <div className="flex items-center space-x-3">
//             <div className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 border border-gray-300">
//               {isLoading && !otherUser ? <div className="w-full h-full bg-gray-200 animate-pulse"></div> : getUserAvatar(otherUser)}
//             </div>
//             <div>
//               <h2 className="font-semibold text-gray-800">
//                 {isLoading && !otherUser ? "Loading..." : otherUser?.first_name || otherUser?.username || "User"}
//               </h2>
//               <p className="text-xs text-gray-500">
//                 {isLoading && !otherUser ? "Loading..." : "Online"} {/* You might fetch actual online status */}
//               </p>
//             </div>
//           </div>
//           {/* Removed the close button as it's a page now */}
//         </div>

//         {/* Messages area */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {isLoading && messages.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-gray-500">
//               <Loader2 className="h-8 w-8 animate-spin mb-2" />
//               <p>Loading messages...</p>
//             </div>
//           ) : error && messages.length === 0 ? (
//              <div className="flex flex-col items-center justify-center h-full text-red-500 text-center">
//                 <p className="mb-2">{error}</p>
//                  <Button onClick={handleRetry} variant="outline">Retry</Button> {/* Add a retry button */}
//              </div>
//           ) : messages.length === 0 ? (
//             <div className="text-center text-gray-500 py-10">
//               No messages yet. Start the conversation!
//             </div>
//           ) : (
//             messages.map((message) => {
//               const isUser = message.sender === user?.id;
//               // Ensure message ID is a string or stable number for keys, tempId might cause issues if not replaced quickly
//               const key = message.id || `temp-${message.created_at}-${message.sender}`; // Fallback key for optimistic updates
//               return (
//                 <div
//                   key={key}
//                   className={`flex items-start gap-3 ${
//                     isUser ? "flex-row-reverse" : ""
//                   }`}
//                 >
//                   <div className="flex-shrink-0">
//                     <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-gray-300">
//                       {isUser ? getUserAvatar(user) : getUserAvatar(otherUser)}
//                     </div>
//                   </div>

//                   <div
//                     className={`flex flex-col ${
//                       isUser ? "items-end" : "items-start"
//                     }`}
//                   >
//                     <div
//                       className={`rounded-lg p-3 max-w-xs sm:max-w-sm lg:max-w-md break-words ${
//                         isUser
//                           ? "bg-blue-500 text-white"
//                           : "bg-gray-200 text-gray-800"
//                       }`}
//                     >
//                       <p className="text-sm">{message.message}</p>
//                     </div>
//                     <span
//                       className={`text-xs text-gray-500 mt-1 ${
//                         isUser ? "text-right" : "text-left"
//                       }`}
//                     >
//                       {formatTime(message.created_at)}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//           <div ref={messagesEndRef} /> {/* Scroll anchor */}
//         </div>

//         {/* Input area */}
//         <div className="border-t border-gray-200 p-3 bg-white sticky bottom-0 z-10"> {/* Sticky input area */}
//           {error && messages.length > 0 && ( // Show error below input if messages are loaded
//             <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
//           )}
//           <div className="flex items-center gap-2">
//             <input
//               type="text"
//               placeholder={
//                 isSending ? "Sending message..." : "Type your message..."
//               }
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               value={inputText}
//               onChange={handleInputChange}
//               onKeyDown={handleKeyPress}
//               disabled={isSending || isLoading || !user?.id} // Disable while sending, loading, or not authenticated
//             />
//             <Button
//               onClick={handleSendMessage}
//               disabled={inputText.trim() === "" || isSending || isLoading || !user?.id} // Disable if no text, sending, loading, or not auth
//               className="p-2 rounded-full"
//               aria-label="Send message"
//             >
//               {isSending ? (
//                 <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
//               ) : (
//                 <Send size={20} className="text-blue-500" />
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
## MyList

**MyList** is a full-stack media management application that allows users to create, organize, and manage personalized lists of movies, TV shows, and other media. It features a secure, Node.js/Express backend integrated with MongoDB and the TMDb API, along with a responsive React-based frontend that delivers an intuitive user experience.

---

### Project Overview

#### Backend

- **Architecture & Technologies:**  
  Built with Node.js and Express, the backend uses MongoDB (via Mongoose) to manage data, ensuring a robust and scalable API.
  
- **Core Features:**  
  - **User Management:**  
    Users can register, log in, update their profiles, and reset passwords. JWT authentication secures endpoints, while passwords are hashed for security.
  - **List & Media Management:**  
    Users can create, update, retrieve, and delete lists that store media items. Media entries are enriched with details from TMDb, and duplicate entries are prevented.
  - **TMDb Integration:**  
    The application fetches dynamic data—such as popular, newly released, and top-rated media—from the TMDb API, providing up-to-date content.
  - **Error Handling & Security:**  
    Thoughtful error handling ensures that users receive meaningful feedback, and middleware helps secure endpoints from unauthorized access.

#### Frontend

- **Architecture & Technologies:**  
  Developed using React, the frontend is structured with a clean folder hierarchy that separates assets, components, pages, and services.
  
- **User Interface & Experience:**  
  - **Responsive Design:**  
    Intuitive layouts and styles ensure an engaging experience on both desktop and mobile devices.
  - **Dynamic Components:**  
    Components such as forms, cards, and pagination facilitate smooth interactions for adding media, browsing lists, and viewing detailed media information.
  - **Service Integration:**  
    Frontend services communicate with the backend API to handle user authentication, list and media management, and search functionality.

#### Purpose & Use Cases

- **Media Enthusiasts:**  
  MYLIST provides an organized way for users to track movies, TV shows, and other media, whether they’re planning to watch, currently watching, or have already finished a title.
- **Review & Recommendation:**  
  Users can rate and review media items, offering insights and recommendations within their personalized collections.
- **Dynamic Content:**  
  Integration with the TMDb API ensures that users have access to the latest media details, trailers, cast information, and more.

---


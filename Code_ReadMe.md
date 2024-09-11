Oak Wilt Detection using VueJS and Flask

This project aims to detect Oak Wilt in tree images using a trained machine learning model with reinforcement learning. The project is divided into two parts: the Frontend developed in VueJS and the Backend powered by Flask with TensorFlow. The application allows users to upload images, receive predictions about Oak Wilt, and provide feedback to improve the model's performance over time.

---

 Backend: Flask and TensorFlow

The backend serves as the core processing unit of the application. It handles image uploads, image classification, and feedback to improve the model via Reinforcement Learning from Human Feedback (RLHF).

 Main Functions

1. Image Upload and Processing (`/upload-images`):
   This function handles the uploading of images and their processing for Oak Wilt detection. After saving the images, it utilizes a deep learning model to predict the likelihood of Oak Wilt. Based on the predictions, images are categorized into four groups:
   - This Picture Has Oak Wilt
   - High Chance of Oak Wilt
   - Color Changes in Tree Leaves
   - Not an Oak Wilt
   
   For each image, the app retrieves its GPS metadata to record the location of the trees. This data is saved in CSV and GeoJSON formats for further analysis.

2. Image Prediction (`predict_img`):
   The `predict_img` function resizes and normalizes the uploaded image to meet the input requirements of the pre-trained model, which expects images of size 256x256. It then uses TensorFlow to predict whether the image contains signs of Oak Wilt.

3. GPS Data Extraction (`get_gps_data`):
   The function retrieves the GPS coordinates from the image’s EXIF metadata. This is critical for tracking the geographic spread of Oak Wilt.

4. Feedback Submission and Model Retraining (`/submit-feedback`):
   This function allows users to submit feedback on the accuracy of the predictions. Feedback is saved in a JSON file, and the model is retrained based on this feedback. The retraining is done with a small batch of new data, which helps the model learn from errors over time.

5. Backup Model Strategy:
   During the maintenance phase, the system has a backup model that kicks in if the model starts producing inaccurate results due to improper feedback during training. This ensures the robustness of the system, preventing any deterioration in performance.

6. File Serving and Downloading:
   Routes like `/images/<filename>` and `/results.csv` handle serving the uploaded images and the results CSV file, allowing users to download their results and visual data analysis.

---

 Frontend: VueJS

The frontend provides the interface for users to upload images, view predictions, and provide feedback.

 Key Components:

1. Image Upload and Processing:
   Users can upload multiple images at once using the upload form. Each image is sent to the backend for processing, and the result is displayed in a user-friendly format.

2. Results Display:
   After the backend processes the images, the frontend displays the prediction results. Each prediction is shown with a corresponding color-coded marker:
   - Green for "CHANGES OF COLORS ON TREE LEAVES"
   - Red for "THIS PICTURE HAS OAK WILT"
   - Orange for "THERE'S A HIGH CHANCE OF OAK WILTS"

   These color markers are saved in the `frontend/src/assets` directory for easy customization.

3. Feedback Form:
   Once the predictions are displayed, users have the option to provide feedback. If a prediction is incorrect, users can flag it, and the backend will use this feedback to improve the model through retraining.

4. Marker System:
   In the VueJS components, specific lines are responsible for rendering color markers based on the backend's prediction categories:
   - Green Marker: Displayed when the image is classified as "CHANGES OF COLORS ON TREE LEAVES"
   - Red Marker: Displayed when the image is classified as "This Picture Has Oak Wilt."
   - Orange Marker: Displayed for "High Chance of Oak Wilt."

5. Results Storage:
   The results of the predictions, including the color markers, are stored in a structured format that allows for easy access and visualization in future sessions. The markers and icons associated with the different prediction results are stored in `src/assets`.

---

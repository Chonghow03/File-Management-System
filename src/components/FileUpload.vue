<template>
  <div class="file-upload-container">
    <h2>File Upload System</h2>
    <!-- Label and file input for uploading files -->
    <label for="fileInput" class="file-input-label">Upload Files:</label>
    <input
      type="file"
      id="fileInput"
      class="file-input"
      @change="handleFileChange"
      multiple
      aria-describedby="fileInputDescription"
    />
    <p id="fileInputDescription" class="input-description">
      Select multiple files to upload. Supported formats:
      {{ supportedFormats }}.
    </p>

    <!-- Button to initiate the upload process -->
    <button class="upload-button" @click="uploadFiles">Upload Files</button>

    <!-- Error message display -->
    <div v-if="error" class="error-message">{{ error }}</div>
    <!-- Success message display -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Display list of selected files -->
    <div v-if="files.length > 0">
      <h2>Selected Files:</h2>
      <ul class="selected-file-list">
        <li
          v-for="(file, index) in files"
          :key="file.name"
          class="selected-file-item"
        >
          {{ file.name }}
          <!-- Button to remove a selected file from the list -->
          <button class="remove-button" @click="removeSelectedFile(index)">
            &minus;
          </button>
        </li>
      </ul>
    </div>

    <!-- Search input for filtering uploaded files -->
    <h2>Search Uploaded Files</h2>
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search files..."
      class="search-input"
    />

    <!-- Display uploaded files organized by category -->
    <h2>Uploaded Files by Category</h2>
    <div
      v-for="(categoryFiles, category) in filteredCategorizedFiles"
      :key="category"
    >
      <h3>{{ category.charAt(0).toUpperCase() + category.slice(1) }}</h3>
      <ul class="file-list" v-if="categoryFiles.length">
        <li v-for="file in categoryFiles" :key="file.name" class="file-item">
          <a :href="file.url" target="_blank">{{ file.name }}</a>
          <!-- Button to delete a specific uploaded file -->
          <button class="delete-button" @click="deleteFile(file)">
            Delete
          </button>
        </li>
      </ul>
      <p v-else>No files in this category.</p>
    </div>
  </div>
</template>

<script>
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';
import '../styles/FileUpload.css';

export default {
  name: 'FileUpload',
  data() {
    return {
      // Holds the files selected for upload
      files: [],
      // List of all uploaded files
      filesList: [],
      // Categorized files based on their type
      categorizedFiles: {
        images: [],
        documents: [],
        videos: [],
        audio: [],
        others: [],
      },
      // Error message to display
      error: null,
      // Success message to display
      successMessage: null,
      // Search query for filtering files
      searchQuery: '',
      // File categories and their associated extensions
      fileCategories: {
        images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
        documents: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'],
        videos: ['mp4', 'mov', 'wmv', 'avi'],
        audio: ['mp3', 'wav', 'ogg', 'flac'],
      },
    };
  },
  computed: {
    // Returns a comma-separated list of supported file formats
    supportedFormats() {
      return Object.values(this.fileCategories).flat().join(', ');
    },
    // Filters categorized files based on the search query
    filteredCategorizedFiles() {
      const searchQueryLower = this.searchQuery.toLowerCase();
      const filteredFiles = {
        images: [],
        documents: [],
        videos: [],
        audio: [],
        others: [],
      };

      // Filter files by category based on search query
      for (const category in this.categorizedFiles) {
        filteredFiles[category] = this.categorizedFiles[category].filter(
          (file) => file.name.toLowerCase().includes(searchQueryLower)
        );
      }

      return filteredFiles;
    },
  },
  methods: {
    // Handles the file input change event
    handleFileChange(event) {
      this.error = null; // Reset error message when files are selected
      const newFiles = Array.from(event.target.files).filter(
        (file) => !this.files.find((f) => f.name === file.name) // Prevent duplicates
      );
      this.files.push(...newFiles);
    },
    // Initiates the file upload process
    async uploadFiles() {
      if (this.files.length > 0) {
        const filesToUpload = [];
        // Check for existing files and handle overwriting
        for (const file of this.files) {
          const exists = this.filesList.some(
            (existingFile) => existingFile.name === file.name
          );
          if (exists) {
            const action = confirm(
              `The file "${file.name}" already exists. Do you want to overwrite it? Press OK to overwrite or Cancel to remove it from the upload list.`
            );
            if (action) {
              filesToUpload.push(file); // Add file to upload if user confirms
            }
          } else {
            filesToUpload.push(file); // Add new files to the upload list
          }
        }

        // Proceed with uploading files
        if (filesToUpload.length > 0) {
          await this.uploadSelectedFiles(filesToUpload);
        } else {
          this.successMessage = 'No new files to upload.';
        }
      } else {
        this.error = 'No files selected.'; // Show error if no files are selected
      }
    },
    // Uploads selected files to Firebase
    async uploadSelectedFiles(filesToUpload) {
      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          const storageRef = ref(storage, `uploads/${file.name}`);
          await uploadBytes(storageRef, file); // Upload file
          const downloadURL = await getDownloadURL(storageRef); // Get download URL
          return { name: file.name, url: downloadURL }; // Return file details
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        this.filesList.push(...uploadedFiles); // Update uploaded files list
        this.successMessage = `Files uploaded successfully: ${uploadedFiles.length}`;
        this.resetFileInput(); // Reset file input after upload
        this.fetchFiles(); // Refresh file list
      } catch (error) {
        this.error = 'Error uploading files: ' + error.message; // Error handling
        console.error('Error uploading files:', error);
      }
    },
    // Resets the file input and clears selected files
    resetFileInput() {
      this.files = [];
      this.error = null; // Clear error message on reset
      const fileInput = document.getElementById('fileInput');
      fileInput.value = '';
    },
    // Removes a selected file from the upload list
    removeSelectedFile(index) {
      this.files.splice(index, 1);
    },
    // Categorizes uploaded files based on their type
    categorizeFiles() {
      this.categorizedFiles = {
        images: [],
        documents: [],
        videos: [],
        audio: [],
        others: [],
      };

      this.filesList.forEach((file) => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        let categorized = false;

        // Classify files into their respective categories
        for (const [category, extensions] of Object.entries(
          this.fileCategories
        )) {
          if (extensions.includes(fileExtension)) {
            this.categorizedFiles[category].push(file);
            categorized = true;
            break;
          }
        }

        // Any files that don't fit categories are placed in 'others'
        if (!categorized) {
          this.categorizedFiles.others.push(file);
        }
      });
    },
    // Fetches uploaded files from Firebase
    async fetchFiles() {
      const storageRef = ref(storage, 'uploads/');
      try {
        const res = await listAll(storageRef); // List all files in the uploads directory
        this.filesList = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef); // Get the download URL for each file
            return { name: itemRef.name, url, ref: itemRef }; // Return file details
          })
        );

        this.categorizeFiles(); // Categorize fetched files
      } catch (error) {
        this.error = 'Error fetching files: ' + error.message; // Error handling
        console.error('Error fetching files:', error);
      }
    },
    // Deletes a specific file from Firebase
    async deleteFile(file) {
      const fileRef = ref(storage, `uploads/${file.name}`);
      try {
        await deleteObject(fileRef); // Delete the file from storage
        this.successMessage = 'File deleted successfully!'; // Success message
        this.fetchFiles(); // Refresh file list
      } catch (error) {
        this.error = 'Error deleting file: ' + error.message; // Error handling
        console.error('Error deleting file:', error);
      }
    },
  },
  // Lifecycle hook to fetch files when the component is mounted
  mounted() {
    this.fetchFiles();
  },
};
</script>

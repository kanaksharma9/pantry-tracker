"use client"

import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore, storage } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Webcam from 'react-webcam';
import Image from 'next/image'; 
import React from 'react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const buttonStyle = {
  borderRadius: '50%',
  width: 40,
  height: 40,
  minWidth: 0,
  fontSize: '24px',
  padding: 0,
};

const imgStyle = {
  borderRadius: '8px',
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageSrc, setImageSrc] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item, imageUrl = '') => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, imageUrl }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, imageUrl });
    }
    await updateInventory();
  };

  const incrementItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  const handleCapture = (webcamRef) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    handleCameraClose();
  };

  const uploadImage = async (imageSrc, itemName) => {
    const storageRef = ref(storage, `images/${itemName}.jpg`);
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleAddItem = async () => {
    if (imageSrc) {
      const imageUrl = await uploadImage(imageSrc, itemName);
      await addItem(itemName, imageUrl);
    } else {
      await addItem(itemName);
    }
    setItemName('');
    setImageSrc('');
    handleClose();
  };

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const webcamRef = useRef(null);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
      p={3}
      bgcolor="#f5f5f5"
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add New Item
        </Button>
        <TextField
          id="search-bar"
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Stack>

      <Box border="1px solid #ccc" borderRadius="8px" overflow="hidden">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2" color="#333" textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" spacing={2} overflow="auto" p={2}>
          {filteredInventory.map(({ name, quantity, imageUrl }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              bgcolor="#fff"
              border="1px solid #ddd"
              borderRadius="8px"
              paddingX={3}
              paddingY={2}
              boxShadow={1}
              gap={2}
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={80}
                  height={80}
                  style={imgStyle} // Inline borderRadius
                />
              )}
              <Box flexGrow={1}>
                <Typography variant="h6" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body1" color="#555">
                  Quantity: {quantity}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" sx={buttonStyle} onClick={() => incrementItem(name)}>
                  +
                </Button>
                <Button variant="contained" color="error" sx={buttonStyle} onClick={() => removeItem(name)}>
                  -
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-item-modal-title"
        aria-describedby="add-item-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="add-item-modal-title" variant="h6">
            Add Item
          </Typography>
          <Stack spacing={2}>
            <TextField
              id="item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="contained" color="secondary" onClick={handleCameraOpen}>
              Take Picture
            </Button>
            <Button variant="contained" color="primary" onClick={handleAddItem}>
              Add
            </Button>
          </Stack>
          {imageSrc && (
            <Box mt={2}>
              <Image
                src={imageSrc}
                alt="Captured"
                width={400}
                height={300}
                style={imgStyle} // Inline borderRadius
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* Camera Modal */}
      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={modalStyle}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            height="auto"
            style={{ borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <Button onClick={() => handleCapture(webcamRef)}>Capture</Button>
        </Box>
      </Modal>
    </Box>
  );
}

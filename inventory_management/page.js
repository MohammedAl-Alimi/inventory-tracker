'use client'
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import { AppBar, Toolbar, Typography, Container, Box, Modal, Grid, TextField, Button, Collapse, IconButton, Stack } from "@mui/material";
import { collection, getDocs, doc, query, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [image, setImage] = useState(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity, imageUrl) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity, imageUrl }, { merge: true })
    } else {
      await setDoc(docRef, { quantity, imageUrl })
    }

    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    try {
      const storageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      await addItem(itemName, parseInt(itemQuantity), url);
      setImage(null);
      setItemName("");
      setItemQuantity("");
      handleClose();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useEffect(() => {
    updateInventory()
  }, [])

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box sx={{ bgcolor: '#808080', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Master: Your Guide to a Clean Life
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mt: 4 }}>
        <Grid container spacing={2} alignItems="center" mb={4}>
          <Grid item xs={12} sm={8}>
            <TextField
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              size="small"
              InputProps={{
                style: {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" fullWidth onClick={handleOpen} style={{ backgroundColor: '#1976d2', color: '#fff' }}>
              Add New Item
            </Button>
          </Grid>
        </Grid>

        <Box width="100%" border="1px solid #333" borderRadius="8px" p={2} boxShadow={3} bgcolor="white">
          <Box
            width="100%"
            height="100px"
            bgcolor="#ADD8E6"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2}
            borderRadius="8px"
            boxShadow={2}
          >
            <Typography variant="h2" color="#333" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
              Inventory Items
            </Typography>
            <IconButton onClick={() => setListOpen(!listOpen)}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          
          <Collapse in={listOpen} timeout="auto" unmountOnExit>
            <Box mt={2} borderRadius="8px">
              <Grid container spacing={2} sx={{ height: filteredInventory.length > 4 ? '400px' : 'auto', overflow: filteredInventory.length > 4 ? 'auto' : 'visible' }}>
                {filteredInventory.map(({ name, quantity }) => {
                  const isHighlighted = searchQuery && name.toLowerCase().includes(searchQuery.toLowerCase());
                  return (
                    <Grid item xs={12} key={name}>
                      <Box
                        width="100%"
                        minHeight="150px"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        bgcolor={isHighlighted ? "#FFFFE0" : "#FFFFFF"}
                        border={isHighlighted ? "2px solid #FFD700" : "1px solid #ddd"}
                        zIndex={isHighlighted ? 1 : 0}
                        padding={2}
                        borderRadius="8px"
                        boxShadow={isHighlighted ? 4 : 1}
                      >
                        <Typography variant="h3" color="#333" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }} textAlign="center">
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography>
                        <Typography variant="h3" color="#333" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }} textAlign="center">
                          {quantity}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Button variant="contained" onClick={() => addItem(name, 1)}>Add</Button>
                          <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        <Modal open={open} onClose={handleClose}>
          <Box position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -50%)" }} width={{ xs: '90%', sm: 400 }} bgcolor="white" border="2px solid #000"
            boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} borderRadius="8px">
            <Typography variant="h6">Add item</Typography>
            <Stack width="100%" spacing={2}>
              <TextField
                variant='outlined'
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value)
                }}
              />
              <TextField
                variant='outlined'
                fullWidth
                label="Quantity"
                type="number"
                value={itemQuantity}
                onChange={(e) => {
                  setItemQuantity(parseInt(e.target.value))
                }}
              />
              <input type="file" onChange={handleImageChange} accept="image/*" />
              <Button variant="contained" onClick={handleUpload} style={{ backgroundColor: '#1976d2', color: '#fff' }}>
                Upload Image
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}

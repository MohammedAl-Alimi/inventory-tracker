'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { AppBar, Toolbar, Typography, Container, Box, Modal, Stack, TextField, Button, Collapse, IconButton, InputAdornment } from "@mui/material"; // Ensure Collapse and IconButton are imported
import { collection, getDocs, doc, query, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import icon for button

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(''); // Added state for item quantity
  const [searchQuery, setSearchQuery] = useState(''); // Added state for search query
  const [listOpen, setListOpen] = useState(false); // Added state to manage the visibility of the inventory list

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

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity })
    } else {
      await setDoc(docRef, { quantity })
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory() // Correctly fetch the inventory items on component mount
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter(item => // Added filtered inventory based on search query
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box sx={{ bgcolor: '#808080', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* Set the background color to gray */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Master: Your Guide to a Clean Life
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mt: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={4}> {/* Stack to arrange search input and button */}
          <TextField
            variant="outlined"
            value={searchQuery} // Added search input field
            onChange={(e) => setSearchQuery(e.target.value)} // Set search query on change
            placeholder="Search items..."
            size="small" // Set the size of the search input to small
            InputProps={{
              style: {
                backgroundColor: '#1976d2', // Set background color to match "Add New Item" button
                color: '#fff', // Set font color to white
              },
            }}
          />
          <Button variant="contained" onClick={handleOpen} style={{ backgroundColor: '#1976d2', color: '#fff' }}> {/* Same styling as "Add New Item" */}
            Add New Item
          </Button>
        </Stack>

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
            <Typography variant="h2" color="#333">
              Inventory Items
            </Typography>
            <IconButton onClick={() => setListOpen(!listOpen)}> {/* Button to toggle inventory list visibility */}
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          
          <Collapse in={listOpen} timeout="auto" unmountOnExit> {/* Use Collapse to show/hide the inventory list */}
            <Box mt={2} borderRadius="8px"> {/* Encapsulate search results within a bordered box */}
              <Stack
                width="100%"
                height={filteredInventory.length > 4 ? "400px" : "auto"} // Set height for scrollable list if more than 4 items
                spacing={2} // Ensure proper spacing between items
                overflow={filteredInventory.length > 4 ? "auto" : "visible"} // Enable scrolling if more than 4 items
              >
                {filteredInventory.map(({ name, quantity }) => {
                  const isHighlighted = searchQuery && name.toLowerCase().includes(searchQuery.toLowerCase()); // Check if item matches search query
                  return (
                    <Box
                      key={name}
                      width="100%"
                      minHeight="150px"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      bgcolor={isHighlighted ? "#FFFFE0" : "#FFFFFF"} // Highlight if matches search query
                      border={isHighlighted ? "2px solid #FFD700" : "1px solid #ddd"} // Highlight border
                      zIndex={isHighlighted ? 1 : 0} // Bring to front if highlighted
                      padding={2} // Adjust padding to ensure border covers the item properly
                      borderRadius="8px"
                      boxShadow={isHighlighted ? 4 : 1} // Add shadow to highlighted items
                    >
                      <Typography variant="h3" color="#333" textAlign="center">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="h3" color="#333" textAlign="center">
                        {quantity}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={() => addItem(name, 1)}>Add</Button> {/* Add 1 to the existing quantity */}
                        <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
            </Box>
          </Collapse>
        </Box>

        <Modal open={open} onClose={handleClose}>
          <Box position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -50%)" }} width={400} bgcolor="white" border="2px solid #000"
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
              <Button variant="contained" onClick={() => {
                addItem(itemName, itemQuantity)
                setItemName("")
                setItemQuantity("")
                handleClose()
              }} style={{ backgroundColor: '#1976d2', color: '#fff' }}> {/* Same styling as "Add New Item" */}
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Container>
    </Box>
  )
}

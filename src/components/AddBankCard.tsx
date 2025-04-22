import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Box, Typography } from '@mui/material';
import { ChromePicker } from 'react-color';

interface AddBankCardProps {
  onSubmit: (cardData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    color: string;
  }) => void;
}

const AddBankCard: React.FC<AddBankCardProps> = ({ onSubmit }) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    color: '#1976d2',
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [field]: event.target.value });
  };

  const handleColorChange = (color: any) => {
    setCardData({ ...cardData, color: color.hex });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Bank Card
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Card Number"
              value={cardData.cardNumber}
              onChange={handleChange('cardNumber')}
              fullWidth
              required
              inputProps={{ maxLength: 16 }}
            />
            <TextField
              label="Card Holder Name"
              value={cardData.cardHolder}
              onChange={handleChange('cardHolder')}
              fullWidth
              required
            />
            <TextField
              label="Expiry Date (MM/YY)"
              value={cardData.expiryDate}
              onChange={handleChange('expiryDate')}
              fullWidth
              required
              inputProps={{ maxLength: 5 }}
            />
            <TextField
              label="CVV"
              value={cardData.cvv}
              onChange={handleChange('cvv')}
              fullWidth
              required
              inputProps={{ maxLength: 3 }}
            />
            <Box sx={{ position: 'relative' }}>
              <Button
                variant="outlined"
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{ width: '100%' }}
              >
                Pick Card Color
              </Button>
              {showColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                  <ChromePicker
                    color={cardData.color}
                    onChange={handleColorChange}
                  />
                </Box>
              )}
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Add Card
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBankCard; 
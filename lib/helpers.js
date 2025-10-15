export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

  
};


// export const formatCurrency = (amount) => {
//   return "Rs. " + new Intl.NumberFormat("en-IN").format(amount);
// };
// Helper function to serialize bike data
export const serializeBikeData = (bike, wishlisted = false) => {
  return {
    ...bike,
    price: bike.price ? parseFloat(bike.price.toString()) : 0,
    createdAt: bike.createdAt?.toISOString(),
    updatedAt: bike.updatedAt?.toISOString(),
    wishlisted: wishlisted,
  };
};
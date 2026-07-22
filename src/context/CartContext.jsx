/* eslint-disable react-refresh/only-export-components */

import { createContext, useState } from "react";

export const CartContext= createContext();

export default  function CartProvider({children}){
    const[cartItems,setCartItems] = useState([]);

    const addToCart = (product) => {
  console.log("Added Product:", product);
  setCartItems([...cartItems, product]);
};

return(
    <CartContext.Provider

        value={{
            cartItems,
            addToCart
        }}

    >

        {children}
    </CartContext.Provider>
);
}
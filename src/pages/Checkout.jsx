import React, { useState } from "react";
import axios from "axios";

import { BaseUrl } from "../config/Baseurl";

import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phoneNum: "",
  });

  const cartItem = useSelector((state) => state?.cart?.cartItem);
  const { user, token } = useSelector((state) => state?.signinData);

  const navigate = useNavigate();

  const getTotalPrice = () => {
    let totalPrice = 0;
    cartItem.map((c) => (totalPrice += c.item.price * c.qty));
    return totalPrice;
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const saveOrder = async (paymentDetails) => {
    try {
      const { data } = await axios.post(
        `${BaseUrl}/api/v1/order/sv-ord`,
        { price: getTotalPrice(), items: cartItem, address, paymentDetails },
        config
      );

      console.log(data);

      if (data.success) {
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenRazorPay = (data) => {
    try {
      const options = {
        key: data.KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "E-commerce",
        description: "Thank you",
        order_id: data.order.id,
        handler: async (response) => {
          const { data } = await axios.post(
            `${BaseUrl}/api/v1/order/vrf-ord`,
            { response },
            config
          );

          if (data.success) {
            const paymentDetails = {
              response: response,
              paymentStatus: data.paymentStatus,
            };

            saveOrder(paymentDetails);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: 9262752846,
        },
        notes: {
          address: "Allalpatti DMC, Darbhanga, Bihar",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    }
  };

  const createOrder = async () => {
    try {
      const { data } = await axios.post(
        `${BaseUrl}/api/v1/order/crt-ord`,
        { amount: getTotalPrice() },
        config
      );

      if (data.success) handleOpenRazorPay(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:space-x-8 w-11/12 mx-auto min-h-[75vh] mt-7 md:mt-12">
      <div className="lg:w-1/2 mt-14 lg:mt-0">
        <CheckoutForm
          address={address}
          setAddress={setAddress}
          createOrder={createOrder}
        />
      </div>
      <div className="lg:w-[40%]">
        <OrderSummary />
      </div>
    </div>
  );
};

export default Checkout;

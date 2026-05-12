import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signin(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const navigate = useNavigate();

    const handleSignin = async (e) => {
        e.preventDefault();

        try{
            const res = await axios.post(
                "http://localhost:3001/api/auth/login",
                {
                    email,
                    password
                }
            );

            console.log(res.data);

            localStorage.setItem("token", res.data.token);

            alert("Login successfull");

            navigate("/");
        } catch (err) {
            console.log(err.response?.data || err.message);
            alert("Login failed");
        }
    };
    return (
        <section>
    
          <h1>Signin</h1>
    
          <form onSubmit={handleSignin}>
    
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
    
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
    
            <button type="submit">
              Sign In
            </button>
    
          </form>
    
        </section>
      );
}

export default Signin
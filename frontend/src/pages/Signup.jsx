import { useState } from "react";
import axios from "axios";

function Signup(){
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        try{
            const res = await axios.post(
                "http://localhost:3001/api/auth/register",
                {
                    email,
                    password
                }
            );
            console.log(res.data);
            alert("Signup successful");
        } catch (err) {
            console.log(err);
            alert("Signup failed");
        }
    };

    return (
        <section>
    
          <h1>Signup</h1>
    
          <form onSubmit={handleSignup}>
    
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
              Sign Up
            </button>
    
          </form>
    
        </section>
      );
}

export default Signup
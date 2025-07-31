import { Link } from "react-router-dom";
import treediaImageUrl from "../assets/img/treedia.png";
export const Footer = () =>{

    return (

          <div className="container-fluid bg-dark text-center py-2 mt-auto">
           <p className="text-white"><Link to="/" className="d-flex justify-content-center">
           <img src={treediaImageUrl} alt="Logo" style={{ height: '50px' }} /></Link>CopyRight <i class="fa-solid fa-copyright"></i> App Treedia Free Comerce</p>
          </div>


    )
}
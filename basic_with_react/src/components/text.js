
import Button from "../UI/Button";
import "./CanvasSection.css";

const TextSection = (props)=>{



return(
    <>
    <div>
    <form onSubmit={getFormData}>
        <input type='text'/>
        <Button>Submit</Button>
    </form>
    </div>
     
    </>
  
)

}

export default TextSection;
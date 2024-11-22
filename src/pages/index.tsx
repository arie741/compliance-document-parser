import {ChangeEvent, FormEvent, useState} from 'react'
import axios from "axios";
import Image from "next/image";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState([])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setFile(e.target.files[0]);
  };

  const onClick = (e: MouseEvent<HTMLInputElement>) => {
    e.currentTarget.value = "";
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setImageSrc(null)

    if (!file) {
      return;
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes).toString('base64');

    const src = 'data:image/jpeg;base64,' + buffer;
    try{
      const response = await axios.post('/api/compliance-parse', JSON.stringify({ image: buffer }), {
        headers: {
          "Content-Type": "application/json",
        },
      })

      setData(response.data)
      setFile(null);
      setImageSrc(src)
    } catch(error){
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex flex-row justify-center">
      <div className={"bg-slate-300 min-h-96 p-5 mt-10 text-slate-900"}>
        <p className={"text-slate-900 mb-5 text-3xl"}>Insert an image document (JPEG)</p>
        {error && <div className={"text-rose-600"}>{error}</div>}
        <form method="POST" encType="multipart/form-data" onSubmit={onSubmit} className={"text-slate-950"}>
          <input type="file" accept="image/*" name="image" disabled={isLoading} onChange={onFileChange} onClick={onClick}/>
          <br/>
          <button className={"bg-green-400 py-1 px-3.5 rounded mt-3.5"} type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Parse document'}</button>
        </form>
        {imageSrc && (
          <div className={"mb-10 mt-5"}>
            Original image: <Image src={imageSrc} width={300} height={400} alt="Uploaded Image" />
          </div>
        )}
        {
          data && data.map((annotation, index) => {
            const vertices = annotation?.pageAnchor?.pageRefs[0]?.boundingPoly?.normalizedVertices;
            return (
              <div key={index} className={"my-5"}>
                <div>{annotation?.type}:</div>
                <div><b>{annotation?.mentionText}</b></div>
                <div className={"border border-sky-500 relative overflow-hidden"} style={{
                  width: "400px",
                  height: "100px",
                  backgroundImage: `url(${imageSrc})`,
                  backgroundPosition: `top ${vertices[0].y * 100}% left ${vertices[0].x * 100}%`
                }}>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

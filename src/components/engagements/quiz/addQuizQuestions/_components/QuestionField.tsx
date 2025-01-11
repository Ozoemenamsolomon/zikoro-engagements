import { TextEditor } from "@/components/custom";
import { AddQuizImageIcon } from "@/constants";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";

export function QuestionField() {
    const [value, setValue] = useState("")

    function onChange(v:string) {
            setValue(v)
    }
    return (
        <div className="w-full ">
            <div className="w-full flex items-center justify-between">
                <p>Question</p>
                <InlineIcon icon="icon-park-twotone:delete" fontSize={22}/>
            </div>
            <div className="flex items-center gap-x-3">
                <div className="w-[98%]">
                    <TextEditor value={value} onChange={onChange}/>
                </div>
                <button onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}>
                    <AddQuizImageIcon/>
                </button>
            </div>

        </div>
    )
}
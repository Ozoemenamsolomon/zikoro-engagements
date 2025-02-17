"use client"

export function CustomSelect({className, hintText}:{className:string, hintText:string}) {
    return (
        <div className="w-full px-3 relative rounded-md bg-basePrimary-100 h-11">
            <p className="">{hintText}</p>
        </div>
    )
}
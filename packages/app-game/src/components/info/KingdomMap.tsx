import classNames from "classnames";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import { useEffect, useRef } from "react";
import { IWorldNode, useWorld } from "../../context/World.context";
import { WorldGenerator2 } from "../world2/WorldGenerator2";
import { BuiltinPopulators } from "../world2/BuiltinPopulators";
import { BuiltinRules } from "../world2/BuiltinRules";
import { usePlayer } from "../../context/Player.context";
import { WorldNodeAreaType } from "../../model/world.enums";

const BLACK_ICON_DATA = {
    "mdi:house": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAOlJREFUWEftluENAiEMhd9t4ig6ibqJTqJOoqPcKOYZSAi2XAvoRUN/E97XR1s6YeWYVtbHAGh14AJgBnCufcoWgDuAbRA+AbgFGBdLLUAqHgUfAI5eCC/ABgBtj5nn2bohPABL4hGGNbGzOmEFYMa03RpmCAuAVzyFpBN8FjWWAFrEoygL86oRlAAOoeCstpfOsU3FWaEBsNIJ0DNECAlA6vFeIG8DKwf4pLg4sL5VA2oh/iwAe5vDJg1OSm1Ed3dAurDUtgNgODAcqHKAPb1XPgEuoPk/7z3/unppH+j1CVUvJAPg/x14AuDKRyEf75vNAAAAAElFTkSuQmCC`,
    "mdi:family-room": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAVRJREFUWEftlusNwjAMhNNNYBOYBJgEmASYBDahm0C/Kq7SyElM+qOAGgkJNc75nJwfjZt5NTP7dwuB5QYsN7CPhNo65+QXazi2Zf/h7VW95wjcu8ObTJacnHNnv4/jS8YWEgeNSIpACVB8rf2fpyGdIXCN7VIEjp0hEZYWoKxc9IKBc7EfcFMEANTeMyb0vwSInmdYFd7gkxvY+owYQYZPgDOckmI3b0Um5EhYCICHHZkgWiF7+D70ApzESkbhu4IYLQQQMwFp+K3cgKZ6VMtBbiG1LARSgfRZIQQ01UvavCYSwEcS/ycI5IqMiBWt5J5p0g2UqqFlv4qABXiKTVGEU8AtZ7+LgLX9WiKz2vTtOSzFpQHECmyxG1pz3I6ZgKTyUbslzSygORvSVKYrKmPfB8JeEB6WyqcOEJVMwjQcBa0NJLMTqAyy7phlLK9DNp5aCLwBEFFXIT3Ps8wAAAAASUVORK5CYII=`,
    "mdi:sign-routes": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAQNJREFUWEftl+sNwjAMhK+bwCSwCbAJTAKbQCeBUehJjYSoUz8IDUjx31jN56tf6VDZusr34+8BrgBWANZRJT9RYA/gPF58GEAuEYhSADcAjxkAnp2k81IAluCPEsSSAIScQMwBMMG2ltAcPpNcyQEscjnBJYDI5VoS9rkqkQBY13eHrHQtXoZeiOIAjIoQc0m4GWqfzYim/YLWB1JKufqAloevs0DzTefmPmD5oBdATNRSrVhLQlcfsERPn58ax1/pA5oSTYGmQFUFOKh244olrlpaBqfzSCPihOTS8m6ceCxHNiWzRQC4rFAByQjheqREANIOkIvS9UCJAJjltThWB3gCBTg9IU7fO44AAAAASUVORK5CYII=`,
    "mdi:city": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAPRJREFUWEftlusNwjAMhK+bwCZsAkwGTAKjsAnFko0Caur4aJogkV+R8vjO9rnNgMZjaMzHzwu4AtgA2LKZ/CYDAt8p+M6KYAWkcAueEsEIMLgAb0qXTEgpwiIYAQ+FngEcdX56wg86D90Z2qyA6gIkmrlhkU6VQM6FgprabBGu0lldC8iZzDJTzYSeyVYTID1+Udo++eqZgNy6tWbOQ5K516jhAc+8b8yuBbAl8EpUnAG2C0ImnStBcwGemdj14hKwAO9csYDczyZ9gHy+B1J40c+qaw80N2HzEnhmYteLTcgCvHOuAO+CRddD77dFyXrZX8AIQVdbIeL5gMMAAAAASUVORK5CYII=`,
    "mdi:forest": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAX9JREFUWEfdl91xAjEMhJdOQiUklQCVkFSSUAlQCZSS25tTxugkyz+X3Ez8koedkz/vynLYYOW1WXl/tAC8AHhkwCP96dNagNP09YcDEOmzz2oAXgFcpgpvAK6qWqSbzKUAtPWeVGAEhJAoIt1NrBSAJ+cJ0/UOQKKI9C6AA4BPp4JA0B26oFcK2RSBttYqsh3i2Q8CN/N099ZEEVjW6k3YjMcMhOgmRA6AV8o7lWd1dRQeQIn1GoJRcNE1qx+oz1zwALyTuN08FefV9PpBX92xlgVQY313FBognWa50+Y0GVBeFE9TNAVoyd0CEauLorAi6AHRjaav8awRLYCSu+9FIKfnIegA/6YjfNaIGqCnAQWqajz/Rg8QpHg8pwA91lvjmd3OR4yPmaf/zIElrLdmwjkzGceo6EBP10ezIoyCAEtaXz0Zo+dYClpZfk3PcORCVl8KgI22UzvdhngJ+ScAzQ4t5cD/B+A81//lcK7Lj5NId/ugNIKol5r11QG+AQgBasDSUb2oAAAAAElFTkSuQmCC`,
};

const WHITE_ICON_DATA = {
    "mdi:house": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAPZJREFUWEftlusNwjAMhM+bMApMAt2kTAJMAqN0k0OWEok+3DppSkGKf0e5L+dXBDuH7KyPCrDKAZI3AJ2IXHNTmQ1A8gngGIRbAA8R6VJBsgAG4lHzBaBJhUgCIHkAoLbHlw8fnAzhBnCIRxhNw8nrhAuApL5Yc+4NN8QiQIb4J6Q6oWkxYxZgpXgU1cK8WwQmAMlLKDiv7XPnWmtWTAKEAaMAJWMSYgRg9HgpkNHA6gFsLD45sL5VA2Yh/i2A9vZw8eiYtkZ0cQdGFy60bQWoDlQHshzQnj4bS0A/oL09H1a3+3y8d/FDUmoLJf8HthauDvyMA29zH6QhcQh7kwAAAABJRU5ErkJggg==`,
    "mdi:family-room": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAWZJREFUWEftVsFxwyAQ5DqJO0kqSVxJ7EriVGJ1Eney1mo4D8LAncTDjkd87Bkty3Lswkl48JAHrx82AVsFzAoA+MqMegkhXESEv7NRwPL7UMLqxKoAAOdx8nsjJQcROfJ7XPingR1CCPuSkKIAB6GutYt//hxxpoBTjqsJ+B6BBw9pxLR2rzQnEdl7BZAwP/uSHiV8PQHcPY/hzTiGJRX4EBGacTZuHgDAxbgo4/UbUUxCS4RHAPlowAGAHtVREzEJiIvnTqbDPw0zegTQzNzQHT9FqICS6xkZTmQVasMjoLaRKRUqoOT6CQAAPQLGy0pi6fNU/R8BrYyrWemV4ohVrFbYPALHbWhC1h6BSdwJMD3QyW9Ofy4BjIjnQTG3tQAwPc/pVWw1IAu4TejtaZ71AwDYAenNx4dDY2YyGgDGVLurXdoZ3TUkyc1XbCDWKEljyJsx5Xg+AWt22DPHbMt7yD1zNwFX5P+9Id7qqKoAAAAASUVORK5CYII=`,
    "mdi:sign-routes": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAARRJREFUWEftl+ERgjAMhZNNcBLdRN1EJ9FN1Elkk6fvrvyBQNJeD/Akf1vo1/T1JVVZOHTh9eW3AQA8RKRR1V1pJoszAOAkIre08FlV7yUQtQCeItJOALSqerXGawFENn+xIOYEIOQAYhQgCewQ2VrGnIFWTIC5Fif4AKBwcU+Er7FbYgE0IvLOSCun1r2GAHIh6gJwSwliSoT7792nGTG8I9h8oJNU3Ac8EfZqgTe9G4/5QORvBQCmUGtZsSfCuA9Edp9uyarKcX0f8DKxtoZky8CfZSAVqiNbrCRWs9/zhGw2JN5HAFgh+R7oB7tiHgVNKRzZTgiAzQr7BStYdrMeKSUAXQ9gEuQ+ULIBwrkNTlwc4AOjX44h0l0O+gAAAABJRU5ErkJggg==`,
    "mdi:city": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAPtJREFUWEftltENgzAMRH2b0E26SdvJSidpR2ETQ5AjRTQQ+SKUVCpfSCbc8/ncAml8obG+/DaAqr5FZABwYZ2kHTDxqwlPLAQFsBGPzVMQboBEfBKRj6kHJwYRcUMwAGqiI4BHuFfV5yJ+D/cAXO90PWxi5wJYN0ehXjsNdmdGUO+AqsYOqc2qHkFPANmQJbacE8LEgeYAYcdf1vFtCVz81Ysm7NXX1dy7AIxp7WsNazNQSu42pF0DsCM4HJHHASqE3i05GkFzgFKeqLpnBJRA6ZAHIPtnkwhQdQ9A8ww0B6AsLo3IM4JSnqh6/wBUWxWH3B+lFVrZo3+AGZsj3CGt3ah3AAAAAElFTkSuQmCC`,
    "mdi:forest": `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAZtJREFUWEftl+FRwzAMha1N6CTQSYBJKJPQTgJMQjd55PmSXOJIshyX6x/8p3fVRf78niQnku685M77p2YAAA8icrXAa/HyuSYAAG9MICLvGkAtrj0TBgDwlFL6HJMcReRrmbAWtxQLAVDWlNLPIgktIES2ohb36iwKwJNTgeU6TVYAcONdAABeUkofRpIMAYDqUKVyzZC7LFCk1fIcBnueh8DJ2OTgdY1rgSFtuQ+L8dWByHELwgQYW8o6lSr1HitUgKD0JQSt4GJBavWgWmEBWEXlFXRuTceKVetOiTYAjdJ3W7ECKKaZd1ovRhV4WsuK1RSdAXb6roE0WaFZUI7dFiVWhaa08aYQNQBtrEYhptPzEBxO/F2O8E0hljXA6zba+xZU03j+ixogWHg8LwF6pN+MZxE5AuAlxstMjfPPDNDZ+6YVgxIXpx2zVXLD9tt3UwZvvGgXtE/GSGbDy7OI8BruWtFXMq2YZoDxremxIPkWkXON7lYALqAH8Q8QVYDzvHzLuU4fJ+M1bsa7LagVUk88pEDPBrVnfwGYmPG6bM6RuAAAAABJRU5ErkJggg==`
}

async function loadBlackIcon(name: keyof typeof BLACK_ICON_DATA) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = BLACK_ICON_DATA[name];
    });
}

async function loadWhiteIcon(name: keyof typeof WHITE_ICON_DATA) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = WHITE_ICON_DATA[name];
    });
}

function clampText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
) {
    const width = ctx.measureText(text).width;
    if (width <= maxWidth) {
        return text;
    } else {
        return text.substring(0, Math.floor(text.length * maxWidth / width) - 3) + "...";
    }
}


export function KingdomMap(
    props: any
) {

    const focusNodeRef = useRef<IWorldNode | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const iconsRef = useRef<Record<string, HTMLImageElement>>(null);

    const canvasCn = classNames(
        "w-[300px] h-[300px] border dark:border-neutral-700 border-neutral-300 text-black dark:text-white"
    );

    const player = usePlayer();
    const world = useWorld();

    const onDrawNodeCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, node: IWorldNode) => {

        if (node.type === "room") {
            ctx.drawImage(
                iconsRef.current["mdi:family-room"],
                x - r,
                y - r,
                2 * r,
                2 * r
            );
        } else if (node.type === "building") {
            ctx.drawImage(
                iconsRef.current["mdi:house"],
                x - r,
                y - r,
                2 * r,
                2 * r
            );
        } else if (node.type === "settlement") {
            ctx.drawImage(
                iconsRef.current["mdi:city"],
                x - r,
                y - r,
                2 * r,
                2 * r
            );
        } else if (node.type === "wilderness") {
            ctx.drawImage(
                iconsRef.current["mdi:forest"],
                x - r,
                y - r,
                2 * r,
                2 * r
            );
        } else if (node.type === "street") {
            ctx.drawImage(
                iconsRef.current["mdi:sign-routes"],
                x - r,
                y - r,
                2 * r,
                2 * r
            );
        } else {

            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();

        }
    };

    const onDrawCircular = (ctx: CanvasRenderingContext2D, w: number, h: number) => {

        // Draw focused node in the middle
        onDrawNodeCircle(ctx, w / 2, h / 2, 7, focusNodeRef.current);

        // Draw connected nodes in a circle around the focused node
        if (focusNodeRef.current) {
            const divide = 2 * Math.PI / focusNodeRef.current.outEdges.length;
            for (let i = 0; i < focusNodeRef.current?.outEdges.length; i++) {
                const alpha = divide * i - Math.PI / 2;
                const cosAlpha = Math.cos(alpha);
                const sinAlpha = Math.sin(alpha);

                const x = w / 2 + (3 * w / 12) * cosAlpha;
                const y = h / 2 + (3 * h / 12) * sinAlpha;

                onDrawNodeCircle(ctx, x, y, 7, focusNodeRef.current.outEdges[i].to);

                ctx.beginPath();
                ctx.moveTo(w / 2 + 25 * cosAlpha, h / 2 + 25 * sinAlpha);
                ctx.lineTo(x - 10 * cosAlpha, y - 10 * sinAlpha);
                ctx.stroke();

            }
        }

        // Draw focused node label box and label
        ctx.fillText(focusNodeRef.current?.name, w / 2, h / 2 + 15);

        // Draw connected nodes labels
        if (focusNodeRef.current) {
            const divide = 2 * Math.PI / focusNodeRef.current.outEdges.length;
            for (let i = 0; i < focusNodeRef.current?.outEdges.length; i++) {
                const alpha = divide * i - Math.PI / 2;
                const cosAlpha = Math.cos(alpha);
                const sinAlpha = Math.sin(alpha);

                const x = w / 2 + (3 * w / 12) * cosAlpha + 30 * cosAlpha;
                const y = h / 2 + (3 * h / 12) * sinAlpha + 15 * sinAlpha;

                ctx.fillText(focusNodeRef.current?.outEdges[i].to.name, x, y);
            }
        }

    };

    const onDrawStreetLike = (ctx: CanvasRenderingContext2D, w: number, h: number, backEdgeType: WorldNodeAreaType, rowEdgeType: WorldNodeAreaType) => {

        // Draw focused node in the middle - bottom
        onDrawNodeCircle(ctx, w / 2, 19 * h / 24, 7, focusNodeRef.current);

        // Draw street line
        ctx.beginPath();
        ctx.moveTo(w / 2, 19 * h / 24 - 24);
        ctx.lineTo(w / 2, 4 * h / 24);
        ctx.stroke();

        const streetLineLength = ((19 * h / 24 - 24) - 4 * h / 24) - 12;

        // Draw focused node label box and label
        ctx.fillText(focusNodeRef.current?.name, w / 2, 19 * h / 24 - 12);

        const backEdge = focusNodeRef.current?.outEdges.find(
            edge => edge.to.type === backEdgeType
        );
        const buildingEdges = focusNodeRef.current?.outEdges.filter(
            edge => edge.to.type === rowEdgeType
        );
        const otherEdges = focusNodeRef.current?.outEdges.filter(
            edge => backEdge.id !== edge.id && !buildingEdges.some(buildingEdge => buildingEdge.id === edge.id)
        );

        // Draw back edge
        if (backEdge) {
            onDrawNodeCircle(ctx, w / 2, 22 * h / 24, 7, backEdge.to);

            ctx.beginPath();
            ctx.moveTo(w / 2, 19 * h / 24 + 8);
            ctx.lineTo(w / 2, 22 * h / 24 - 8);
            ctx.stroke();

            // Draw back edge node label box and label
            ctx.fillText(backEdge.to.name, w / 2, 22 * h / 24 + 15);

        }

        const streetDiv = buildingEdges.length > 0
            ? (streetLineLength / (Math.floor(buildingEdges.length / 2)))
            : 0;

        // Draw buildings alternating left and right
        for (let i = 0; i < buildingEdges.length; i++) {
            const edge = buildingEdges[i];
            const x = w / 2 + (i % 2 === 0 ? -1 : 1) * 30;
            const y = (19 * h / 24 - 24) - 6 - streetDiv * Math.floor(i / 2);

            onDrawNodeCircle(ctx, x, y, 7, edge.to);

            if (i % 2 === 0) {
                // Draw text left
                ctx.textAlign = "right";
                ctx.fillText(
                    clampText(ctx, edge.to.name, 80),
                    x - 15,
                    y
                );

                ctx.beginPath();
                ctx.moveTo(w / 2 - 4, y);
                ctx.lineTo(x + 12, y);
                ctx.stroke();
            } else {
                // Draw text right
                ctx.textAlign = "left";
                ctx.fillText(
                    clampText(ctx, edge.to.name, 80),
                    x + 15,
                    y
                );

                ctx.beginPath();
                ctx.moveTo(w / 2 + 4, y);
                ctx.lineTo(x - 12, y);
                ctx.stroke();
            }

        }

        // Draw other edges
        let otherDivide = otherEdges.length > 0 ? 2 * Math.PI / 3 / otherEdges.length : 0;
        for (let i = 0; i < otherEdges.length; i++) {
            const alpha = -1 * otherDivide * i - Math.PI / 3;
            const cosAlpha = Math.cos(alpha);
            const sinAlpha = Math.sin(alpha);

            const x = w / 2 + 40 * cosAlpha;
            const y = 4 * h / 24 + 25 * sinAlpha;

            onDrawNodeCircle(ctx, x, y, 5, otherEdges[i].to);
        }

    };

    const onLoad = async () => {
        if (iconsRef.current !== null) {
            return;
        }

        const csm = canvasRef.current.computedStyleMap();
        const csmColor = csm.get("color").toString();

        if (csmColor === "rgb(255, 255, 255)") {
            iconsRef.current = {
                "mdi:house": await loadWhiteIcon("mdi:house"),
                "mdi:family-room": await loadWhiteIcon("mdi:family-room"),
                "mdi:sign-routes": await loadWhiteIcon("mdi:sign-routes"),
                "mdi:city": await loadWhiteIcon("mdi:city"),
                "mdi:forest": await loadWhiteIcon("mdi:forest"),
            };
        } else {

            iconsRef.current = {
                "mdi:house": await loadBlackIcon("mdi:house"),
                "mdi:family-room": await loadBlackIcon("mdi:family-room"),
                "mdi:sign-routes": await loadBlackIcon("mdi:sign-routes"),
                "mdi:city": await loadBlackIcon("mdi:city"),
                "mdi:forest": await loadBlackIcon("mdi:forest"),
            };

        }
    };

    const onDraw = async () => {

        await onLoad();

        canvasRef.current.width = 300;
        canvasRef.current.height = 300;

        const ctx = canvasRef.current?.getContext('2d');

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const compStyleMap = canvasRef.current.computedStyleMap();
        const lineColor = compStyleMap.get("color").toString();

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = lineColor;
        ctx.fillStyle = lineColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "9px sans-serif";

        if (focusNodeRef.current?.type === "wilderness") {
            onDrawCircular(ctx, w, h);
        } else if (focusNodeRef.current?.type === "settlement") {
            onDrawCircular(ctx, w, h);
        } else if (focusNodeRef.current?.type === "street") {
            onDrawStreetLike(ctx, w, h, "settlement", "building");
        } else if (focusNodeRef.current?.type === "building") {
            onDrawStreetLike(ctx, w, h, "street", "room");
        } else if (focusNodeRef.current?.type === "room") {
            onDrawCircular(ctx, w, h);
        } else if (focusNodeRef.current?.type === "root") {
            onDrawCircular(ctx, w, h);
        }

    };

    useEffect(
        () => {
            const subs = [
                player.playerLocation.subscribe(
                    location => {
                        focusNodeRef.current = location;
                        onDraw();
                    }
                )
            ];
            return () => {
                subs.forEach(sub => sub.unsubscribe());
            };
        },
        []
    );

    return <>
        <Card>
            <CardTitle>Kingdom</CardTitle>
            <div className="w-full flex flex-row justify-center items-center p-2">
                <canvas ref={canvasRef} className={canvasCn}></canvas>
            </div>
        </Card>
    </>
}
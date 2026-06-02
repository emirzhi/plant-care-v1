import { filterMap } from "@/components/plants/MainView";
import { expect, test } from 'vitest'

test('filterMap', () => {
    const plants =[
        { id: 1, name: "Plant A", type: "houseplant" },
        { id: 2, name: "Plant B", type: "succulent" },
        { id: 3, name: "Plant C", type: "flowering" },
        { id: 4, name: "Plant D", type: "flowering" },
        { id: 5, name: "Plant E", type: "cactus" },
    ]

    const houseplants = plants.filter((p) => filterMap["Houseplants"].includes(p.type));
    
    expect(houseplants).toEqual([{ id: 1, name: "Plant A", type: "houseplant" }]);
})
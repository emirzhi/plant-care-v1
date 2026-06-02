import { expect, test } from 'vitest'
import { render, screen } from "@testing-library/react"
import MainView from "@/components/plants/MainView";

test('MainView', () => {
    render(<MainView plants={[]} />)
    expect(screen.getByText("Plant Care")).toBeInTheDocument()
})

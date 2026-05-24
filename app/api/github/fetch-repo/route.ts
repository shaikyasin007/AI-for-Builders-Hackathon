import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { owner, repo } = await request.json()

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing owner or repo' },
        { status: 400 }
      )
    }

    // Fetch public GitHub repo data
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    const repoData = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        name: repoData.name,
        url: repoData.html_url,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        owner: repoData.owner.login,
        avatar: repoData.owner.avatar_url,
      }
    })
  } catch (error) {
    console.error('[v0] GitHub fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repository data' },
      { status: 500 }
    )
  }
}

class Binboi < Formula
  desc "HTTP tunneling CLI for Binboi"
  homepage "https://github.com/Miransas/binboi"
  version "0.4.0"
  license "MIT"

  if OS.mac? && Hardware::CPU.arm?
    url "https://github.com/Miransas/binboi/releases/download/v#{version}/binboi_#{version}_darwin_arm64.tar.gz"
    sha256 "REPLACE_WITH_DARWIN_ARM64_SHA256"
  elsif OS.mac? && Hardware::CPU.intel?
    url "https://github.com/Miransas/binboi/releases/download/v#{version}/binboi_#{version}_darwin_amd64.tar.gz"
    sha256 "REPLACE_WITH_DARWIN_AMD64_SHA256"
  elsif OS.linux? && Hardware::CPU.arm?
    url "https://github.com/Miransas/binboi/releases/download/v#{version}/binboi_#{version}_linux_arm64.tar.gz"
    sha256 "REPLACE_WITH_LINUX_ARM64_SHA256"
  else
    url "https://github.com/Miransas/binboi/releases/download/v#{version}/binboi_#{version}_linux_amd64.tar.gz"
    sha256 "REPLACE_WITH_LINUX_AMD64_SHA256"
  end

  def install
    bin.install "binboi"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/binboi version")
  end
end
